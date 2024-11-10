const getWeather = () => 'very cold. 17deg';

export const runTool = async (toolCall, userMessage) => {


    switch (toolCall.function.name) {
        case 'get_weather':
            return getWeather();

        default:
            throw new Error(`Unknown tool: ${toolCall.function.name}`);
    }
};
