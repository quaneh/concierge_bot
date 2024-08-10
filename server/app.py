from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain
import os
import yaml

app = Flask(__name__)
CORS(app)

# Initialize the OpenAI chat model (you can use "gpt-3.5-turbo" or "gpt-4")
llm = ChatOpenAI(model_name="gpt-4o", temperature=0.7)

# Load the prompt template
with open('prompts/prompt.txt', 'r') as file:
    template = file.read()

# Define the chat prompt template
prompt = ChatPromptTemplate.from_template(template)

# Create the LLMChain with the chat model
chain = prompt | llm

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    tenant_id = data.get('tenant_id')
    guest_name = data.get('guest_name')
    guest_message = data.get('guest_message')
    
    if not tenant_id:
        return jsonify({"error": "Access denied"})

    if not guest_name or not guest_message:
        return jsonify({"error": "Name and message are required"}), 400
    
    # Open and read the YAML file
    with open('config/tenants.yaml', 'r') as file:
        tenants = yaml.safe_load(file)
        
    # Look up the tenant name by ID
    tenant_info = tenants.get(tenant_id)
    tenant_path = tenant_info["path"]
    tenant_name = tenant_info["name"]
    
    with open(f'config/{tenant_path}/faq.txt', 'r') as file:
        faq = file.read()
        
    with open(f'config/{tenant_path}/events.txt', 'r') as file:
        events = file.read()

    # Generate the response using the LLMChain
    response = chain.invoke(input={"tenant_name":tenant_name, "guest_name":guest_name, "faq":faq, "events":events, "guest_message":guest_message})

    return jsonify({"response": response.content})

@app.route('/tenant/<tenant_id>', methods=['GET'])
def get_tenant_name(tenant_id):
    try:
        # Open and read the YAML file
        with open('config/tenants.yaml', 'r') as file:
            tenants = yaml.safe_load(file)
        
        # Look up the tenant name by ID
        tenant_name = tenants.get(tenant_id)["name"]
        
        if tenant_name:
            return jsonify({"tenant_id": tenant_id, "tenant_name": tenant_name})
        else:
            return jsonify({"error": "Tenant not found"}), 404
    
    except FileNotFoundError:
        return jsonify({"error": "Tenants file not found"}), 500
    except yaml.YAMLError:
        return jsonify({"error": "Error parsing tenants file"}), 500

if __name__ == '__main__':
    app.run(debug=True)