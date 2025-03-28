import emailjs from "@emailjs/browser";

export const sendEmail = async ({
  to_email,
  message,
  title,
  name,
}: {
  to_email: string;
  message: string;
  title: string;
  name: string;
}) => {
  try {
    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        from_email: "abdeasif17@gmail.com",
        to_email,
        message,
        title,
        name,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );

    return response;
  } catch (error) {
    console.error("EmailJS Error:", error);
    throw error;
  }
};
