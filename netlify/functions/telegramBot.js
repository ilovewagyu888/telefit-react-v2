import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import FormData from 'form-data';

// Initialize the bot with webhooks
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    webHook: true,
});

bot.setWebHook(`${process.env.VITE_NETLIFY_FUNCTIONS_URL}/telegramBot`)
   .then(() => console.log("Webhook set successfully"))
   .catch((err) => console.error("Error setting webhook:", err));

// Webhook handler
export const handler = async (event) => {
    try {
        console.log("Received webhook event:", event.body);
        const body = JSON.parse(event.body);
        bot.processUpdate(body);
        return {
            statusCode: 200,
            body: 'Webhook received',
        };
    } catch (error) {
        console.error('Error processing webhook:', error);
        return {
            statusCode: 500,
            body: 'Internal Server Error',
        };
    }
};

// Handle photo messages
bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    console.log("Received photo from chat:", chatId);

    const photo = msg.photo[msg.photo.length - 1]; // Get the highest resolution photo

    bot.sendMessage(chatId, '🖼 Received your image! Analyzing now, please wait...');

    try {
        const fileUrl = await bot.getFileLink(photo.file_id);
        console.log("File URL:", fileUrl);

        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const formData = new FormData();
        formData.append('image', Buffer.from(response.data), 'image.jpg');

        bot.sendMessage(chatId, '🔄 Image processing started. This might take a few seconds...');

        const analysisResponse = await axios.post(`${process.env.VITE_NETLIFY_FUNCTIONS_URL}/analyze`, formData, {
            headers: formData.getHeaders(),
        });

        console.log("Analysis response received:", analysisResponse.data);

        const analysisResults = analysisResponse.data;

        foodItems = analysisResults.results.map(item => ({
            ingredient: item.ingredient,
            quantity: parseFloat(item.quantity),
            calories: parseFloat(item.calories)
        }));

        sendCalorieInfo(chatId);
    } catch (error) {
        console.error('Error analyzing image:', error);
        bot.sendMessage(chatId, '❌ Failed to analyze image. Please try again later.');
    }
});

// Send calorie information
const sendCalorieInfo = (chatId) => {
    let resultMessage = `✅ Analysis Complete!\n\n**Total Calories:** ${foodItems.reduce((acc, item) => acc + item.calories, 0).toFixed(2)}\n\n**Details:**\n`;

    foodItems.forEach((item, index) => {
        resultMessage += `${index + 1}. ${item.ingredient} - ${item.quantity}g: ${item.calories} calories\n`;
    });

    const inlineKeyboard = foodItems.map((item, index) => {
        return [
            { text: `Adjust ${item.ingredient}`, callback_data: `adjust_${index}` }
        ];
    });

    bot.sendMessage(chatId, resultMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: inlineKeyboard
        }
    });

    bot.sendMessage(chatId, '💾 You can save this analysis to your account or start a new one. What would you like to do?');
};

// Handle callback queries for adjusting quantities
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith('adjust_')) {
        const index = parseInt(data.split('_')[1]);

        bot.sendMessage(chatId, `Enter the new quantity for ${foodItems[index].ingredient} (in grams):`)
            .then(() => {
                bot.once('message', (msg) => {
                    const newQuantity = parseFloat(msg.text);
                    if (!isNaN(newQuantity)) {
                        updateCalorieInfo(chatId, index, newQuantity);
                    } else {
                        bot.sendMessage(chatId, '⚠️ Invalid quantity. Please enter a valid number.');
                    }
                });
            });
    }
});

// Update calorie information after adjustment
const updateCalorieInfo = (chatId, index, newQuantity) => {
    const item = foodItems[index];
    const originalCaloriesPerGram = item.calories / item.quantity;
    foodItems[index].quantity = newQuantity;
    foodItems[index].calories = (newQuantity * originalCaloriesPerGram).toFixed(2);

    let resultMessage = `🔄 Updated Calorie Info:\n\n**Total Calories:** ${foodItems.reduce((acc, item) => acc + parseFloat(item.calories), 0).toFixed(2)}\n\n**Details:**\n`;

    foodItems.forEach((item, index) => {
        resultMessage += `${index + 1}. ${item.ingredient} - ${item.quantity}g: ${item.calories} calories\n`;
    });

    bot.sendMessage(chatId, resultMessage, { parse_mode: 'Markdown' });
};

// Handle text messages
bot.on('text', (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text.trim().toLowerCase();

    console.log("Received text message:", userMessage);

    if (userMessage === 'save') {
        bot.sendMessage(chatId, '💾 Saving your analysis to your account...');
        // Add functionality here to save the analysis to the user's account
    } else if (userMessage === 'new' || userMessage === '/start') {
        bot.sendMessage(chatId, '🆕 Sure, you can upload a new image for analysis.');
    } else {
        bot.sendMessage(chatId, "🤔 I'm not sure what you mean. Please type 'Save' to save the analysis, or 'New' to start over.");
    }
});
