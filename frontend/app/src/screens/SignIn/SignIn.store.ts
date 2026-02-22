import { router } from "expo-router";
import { create } from "zustand";
import type { User } from "@/api/user";
import { authorize } from "@/auth/auth.store";
import { includes } from "@/utils/includes";

const SignInState = ["EmailSubmit", "VerifyCode", "NewUser", "Idle"] as const;
type SignInState = (typeof SignInState)[number];

const SignInResult = ["success", "failure", "aborted"] as const;
type SignInResult = (typeof SignInResult)[number];

type SignInStateTransition =
	| ((
			payload: SignInStoreStatePayloads,
	  ) =>
			| Promise<SignInState | SignInResult | void>
			| void
			| SignInState
			| SignInResult)
	| SignInState
	| SignInResult;
type SignInStateTransitionType = "next" | "back" | "error";

const SignInStateMachine: Record<
	SignInState,
	Record<SignInStateTransitionType, SignInStateTransition>
> = {
	Idle: { next: "EmailSubmit", back: "aborted", error: "failure" },
	EmailSubmit: { next: "VerifyCode", back: "aborted", error: "failure" },
	VerifyCode: {
		async next(payload) {
			if (payload === undefined) {
				return "failure";
			}
			if (payload.VerifyCode?.newUser) {
				return "NewUser";
			} else if (payload.VerifyCode?.sessionId) {
				authorize();
				return "success";
			}
			return "failure";
		},
		back: "EmailSubmit",
		error: "failure",
	},
	NewUser: {
		next(payload) {
			if (payload?.NewUser?.user && payload.VerifyCode?.sessionId) {
				authorize();
				return "success";
			}
			return "failure";
		},
		back: "failure",
		error: "failure",
	},
};

async function getNextState(
	currentState: SignInState,
	type: SignInStateTransitionType,
	payloads: SignInStoreStatePayloads,
) {
	console.log(`[Transition] ${currentState} with`, payloads);
	const transition = SignInStateMachine[currentState][type];
	if (typeof transition === "function") return await transition(payloads);
	return transition;
}

type AuthPayload = {
	email?: string;
	sessionId?: string;
	newUser?: boolean;
	user?: User;
};

type SignInStoreStatePayloads = Partial<Record<SignInState, AuthPayload>>;

type SignInStoreState = {
	currentState: SignInState;
	statePayload: SignInStoreStatePayloads;
	isTransitioning: boolean;
	signInHandle: ((result: SignInResult) => void) | null;
	start(): Promise<SignInResult>;
	transition(
		type: SignInStateTransitionType,
		payload?: AuthPayload,
	): Promise<void>;
	abort(): void;
};

const DefaultState = {
	currentState: "Idle" as const,
	isTransitioning: false,
	statePayload: {},
	signInHandle: null,
};

export const useSignInStore = create<SignInStoreState>((set, get) => ({
	...DefaultState,
	start() {
		get().signInHandle?.("aborted");

		return new Promise<SignInResult>((resolve) => {
			router.navigate("/SignIn");
			set({
				currentState: "EmailSubmit",
				statePayload: {},
				signInHandle: resolve,
			});
		});
	},
	async transition(type, payload) {
		try {
			set((prev) => ({
				isTransitioning: true,
				statePayload: { ...prev.statePayload, [prev.currentState]: payload },
			}));
			const nextState = await getNextState(
				get().currentState,
				type,
				get().statePayload,
			);
			if (!nextState) {
				return;
			}
			if (includes(SignInState, nextState)) {
				set({ currentState: nextState });
			} else {
				router.back();
				get().signInHandle?.(nextState);
				set(DefaultState);
			}
		} catch {
			const nextState = await getNextState(
				get().currentState,
				"error",
				get().statePayload,
			);
			if (!nextState) {
				return;
			}
			if (includes(SignInState, nextState)) {
				set({ currentState: nextState });
			} else {
				router.back();
				get().signInHandle?.(nextState);
				set(DefaultState);
			}
		} finally {
			set({ isTransitioning: false });
		}
	},
	abort() {
		get().signInHandle?.("aborted");
		set(DefaultState);
	},
}));
