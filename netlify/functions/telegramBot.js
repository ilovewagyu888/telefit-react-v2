import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import FormData from 'form-data';

// Initialize the bot with webhooks
console.log("Initializing bot with webhook...");
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    webHook: true,
});

// Set the webhook URL
bot.setWebHook(`${process.env.VITE_NETLIFY_FUNCTIONS_URL}/telegramBot`)
   .then(() => console.log("Webhook set successfully"))
   .catch((err) => console.error("Error setting webhook:", err));

let foodItems = [];

// Webhook handler
export const handler = async (event) => {
    try {
        console.log("Received webhook event:", event.body);
        const body = JSON.parse(event.body);
        
        // Process the update
        if (body.message) {
            const msg = body.message;
            const chatId = msg.chat.id;

            // Handle photo messages
            if (msg.photo) {
                await handlePhotoMessage(msg);
            }

            // Handle text messages
            if (msg.text) {
                await handleTextMessage(msg);
            }
        }

        // Handle callback queries
        if (body.callback_query) {
            const query = body.callback_query;
            await handleCallbackQuery(query);
        }

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
const handlePhotoMessage = async (msg) => {
    const chatId = msg.chat.id;
    console.log(`Received photo from chat: ${chatId}`);

    try {
        const photo = msg.photo[msg.photo.length - 1];
        console.log("Photo object:", photo);

        await bot.sendMessage(chatId, '🖼 Received your image! Analyzing now, please wait...');

        const file = await bot.getFile(photo.file_id);
        console.log("Received file information:", file);

        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        console.log("File URL:", fileUrl);

        await bot.sendMessage(chatId, '🔄 Image processing started. This might take a few seconds...');

        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        console.log("Image data fetched successfully");

        const formData = new FormData();
        formData.append('image', Buffer.from(response.data), 'image.jpg');

        const analysisResponse = await axios.post(`https://${process.env.VITE_NETLIFY_FUNCTIONS_URL}/analyze`, formData, {
            headers: formData.getHeaders(),
            timeout: 20000
        });

        console.log("Analysis response received:", analysisResponse.data);

        const analysisResults = analysisResponse.data;

        foodItems = analysisResults.results.map(item => ({
            ingredient: item.ingredient,
            quantity: parseFloat(item.quantity),
            calories: parseFloat(item.calories)
        }));

        await sendCalorieInfo(chatId);
    } catch (error) {
        console.error('Error analyzing image:', error);
        await bot.sendMessage(chatId, '❌ Failed to analyze the image. Please try again later.');
    }
};

// Handle text messages
const handleTextMessage = async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text.toLowerCase();

    console.log("Received text message:", userMessage);

    if (userMessage.includes('save')) {
        await bot.sendMessage(chatId, '💾 Saving your analysis to your account...');
        // Add functionality here to save the analysis to the user's account
    } else if (userMessage.includes('new') || userMessage.includes('start')) {
        await bot.sendMessage(chatId, '🆕 Sure, you can upload a new image for analysis.');
    } else {
        await bot.sendMessage(chatId, "🤔 I'm not sure what you mean. Please type 'Save' to save the analysis, or 'New' to start over.");
    }
};

// Handle callback queries for adjusting quantities
const handleCallbackQuery = async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith('adjust_')) {
        const index = parseInt(data.split('_')[1]);

        await bot.sendMessage(chatId, `Enter the new quantity for ${foodItems[index].ingredient} (in grams):`);

        bot.once('message', async (msg) => {
            const newQuantity = parseFloat(msg.text);
            if (!isNaN(newQuantity)) {
                await updateCalorieInfo(chatId, index, newQuantity);
            } else {
                await bot.sendMessage(chatId, '⚠️ Invalid quantity. Please enter a valid number.');
            }
        });
    }
};

// Update calorie information after adjustment
const updateCalorieInfo = async (chatId, index, newQuantity) => {
    const item = foodItems[index];
    const originalCaloriesPerGram = item.calories / item.quantity;
    foodItems[index].quantity = newQuantity;
    foodItems[index].calories = (newQuantity * originalCaloriesPerGram).toFixed(2);

    let resultMessage = `🔄 Updated Calorie Info:\n\n**Total Calories:** ${foodItems.reduce((acc, item) => acc + parseFloat(item.calories), 0).toFixed(2)}\n\n**Details:**\n`;

    foodItems.forEach((item, index) => {
        resultMessage += `${index + 1}. ${item.ingredient} - ${item.quantity}g: ${item.calories} calories\n`;
    });

    await bot.sendMessage(chatId, resultMessage, { parse_mode: 'Markdown' });
};

// Send calorie information
const sendCalorieInfo = async (chatId) => {
    let resultMessage = `✅ Analysis Complete!\n\n**Total Calories:** ${foodItems.reduce((acc, item) => acc + item.calories, 0).toFixed(2)}\n\n**Details:**\n`;

    foodItems.forEach((item, index) => {
        resultMessage += `${index + 1}. ${item.ingredient} - ${item.quantity}g: ${item.calories} calories\n`;
    });

    const inlineKeyboard = foodItems.map((item, index) => {
        return [
            { text: `Adjust ${item.ingredient}`, callback_data: `adjust_${index}` }
        ];
    });

    await bot.sendMessage(chatId, resultMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: inlineKeyboard
        }
    });

    await bot.sendMessage(chatId, '💾 You can save this analysis to your account or start a new one. What would you like to do?');
};
