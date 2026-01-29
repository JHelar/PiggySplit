import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Preview,
	Tailwind,
	Text,
} from "@react-email/components";
import config from "../tailwind.config.json";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:8080";
const verificationCode = process.env.VERIFICATION_CODE_PLACEHOLDER ?? "9123";

export const VerificationLoginCodeEmail = () => (
	<Html>
		<Head />
		<Tailwind config={config}>
			<Body className="bg-white font-sans">
				<Preview>Your login code for Piggy Split</Preview>
				<Container className="mx-auto my-0 max-w-[560px] px-[16px] pt-5 pb-12 text-center">
					<Img
						src={`${baseUrl}/assets/images/piggy-split-logo.png`}
						width="124"
						alt="Piggy Split"
						className="w-[124px] mx-auto inline-block"
					/>
					<Heading className="text-[42px] tracking-[-0.5px] leading-[1.3] font-normal text-[#000000] pt-[8px] px-0 pb-0">
						Your login code for Piggy Split
					</Heading>
					<Text className="mb-[30px] mx-0 mt-0 leading-[1.4] text-[16px] text-[#000000]">
						The code bellow will only be valid for the next 10 minutes.
					</Text>
					<code className="inline-block mx-auto text-center font-mono font-bold px-[24px] py-[24px] bg-[#CCF0FF] text-[#000000] text-[36px] tracking-[10px] rounded">
						{verificationCode}
					</code>
					<Hr className="border-[#D9D9D9] mt-[42px] mb-[26px]" />
					<Text className="text-[#8C8C8C] text-[14px]">Piggy Split</Text>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

export default VerificationLoginCodeEmail;
