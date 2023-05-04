const config = require('../config/config.json');
const { Configuration, OpenAIApi } = require("openai");
const env = process.env.NODE_ENV ? process.env.NODE_ENV : "production";
const configuration = new Configuration({
    organization: config[env].openaiOrganizationId,
    apiKey: config[env].openaiApiKey,
});
const openai = new OpenAIApi(configuration);

module.exports = (function () {

    this.createCompletion = async function (payload) {
        try {
            const response = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: "user",
                        content: `Please provide a likelihood-likelihood-matrix of differential diagnosis for the symptoms - ${payload}`
                    }
                ]
            });
            return {
                code: 200,
                success: true,
                message: "Chat completion created successfully!",
                data: response.data
            };
        } catch (error) {
            if(error.code === null || error.code === undefined){
                error.code = 500;
            }
            return { code: error.code, success: false, data: error.data, message: error.message };
        }
        
    };

    return this;
})();