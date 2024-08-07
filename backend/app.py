from flask import Flask, request, jsonify
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.chains import LLMChain
import os

app = Flask(__name__)

# Set your OpenAI API key
os.environ["OPENAI_API_KEY"] = "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"

# Initialize the OpenAI chat model (you can use "gpt-3.5-turbo" or "gpt-4")
chat_model = ChatOpenAI(model_name="gpt-4o", temperature=0.7)

# Load the prompt template
with open('prompts/prompt.txt', 'r') as file:
    template = file.read()

# Define the chat prompt template
chat_prompt = ChatPromptTemplate.from_template(template)

# Create the LLMChain with the chat model
chain = LLMChain(llm=chat_model, prompt=chat_prompt)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    guest_name = data.get('guest_name')
    guest_message = data.get('guest_message')

    if not guest_name or not guest_message:
        return jsonify({"error": "Name and message are required"}), 400

    # Generate the response using the LLMChain
    response = chain.run(guest_name=guest_name, guest_message=guest_message)

    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True)