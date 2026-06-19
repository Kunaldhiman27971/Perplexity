import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey: process.env.GEMINI_API_KEY
})

export async function testai() {
    model.invoke("What is AI?").then((response) => {
        console.log(response.text)
    })
}



