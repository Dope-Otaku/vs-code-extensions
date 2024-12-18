const vscode = require('vscode');
const { HfInference } = require('@huggingface/inference');

const dogs = {
    nerd: { 
        name: "Nerd", 
        gif: "public/i1.gif", 
        tone: "analytical", 
        traits: ["detailed", "precise"],
        prompt: "You are a nerdy, analytical code reviewer. Provide a detailed, technical analysis of the code focusing on best practices, potential improvements, and technical insights."
    },
    sassy: { 
        name: "Sassy", 
        gif: "public/i2.gif", 
        tone: "sarcastic", 
        traits: ["critical", "edgy"],
        prompt: "You are a sassy, snarky code reviewer. Roast the code with witty, sarcastic comments while pointing out genuine issues."
    },
    romantic: { 
        name: "Romantic", 
        gif: "public/i3.gif", 
        tone: "poetic", 
        traits: ["gentle", "encouraging"],
        prompt: "You are a romantic code reviewer. Provide gentle, poetic, and encouraging feedback about the code, highlighting its potential and beauty."
    },
    normal: { 
        name: "Normal", 
        gif: "public/i4.gif", 
        tone: "balanced", 
        traits: ["neutral", "pragmatic"],
        prompt: "You are a balanced, neutral code reviewer. Provide objective, clear, and constructive feedback about the code."
    }
};

function activate(context) {
    const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

    let disposable = vscode.commands.registerCommand('does-it-suck-.selectDog', async () => {
        const dogNames = Object.keys(dogs).map((key) => dogs[key].name);
        const selectedDogName = await vscode.window.showQuickPick(dogNames, {
            placeHolder: "Choose your coding companion",
        });

        const selectedDog = Object.values(dogs).find(dog => dog.name === selectedDogName);
        if (selectedDog) {
            await analyzeCode(selectedDog, hf);
        }
    });

    context.subscriptions.push(disposable);
}

async function analyzeCode(dog, hf) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor found!");
        return;
    }

    const document = editor.document;
    const code = document.getText();
    
    try {
        // Show a loading message
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `${dog.name} is analyzing your code...`,
            cancellable: false
        }, async () => {
            const analysis = await generateAIComments(code, dog, hf);
            
            // Display the analysis
            const panel = vscode.window.createWebviewPanel(
                'dogCodeAnalysis',
                `${dog.name}'s Code Review`, // Fixed string interpolation
                vscode.ViewColumn.Two,
                { enableScripts: true }
            );

            panel.webview.html = getWebviewContent(analysis, dog);
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Code analysis failed: ${error.message}`);
    }
}

async function generateAIComments(code, dog, hf) {
    try {
        const response = await hf.textGeneration({
            model: 'gpt2', // Replace with a more suitable model
            inputs: `${dog.prompt}\n\nCode to analyze:\n${code}\n\nProvide a comprehensive code review:`,
            parameters: { 
                max_new_tokens: 500,
                temperature: 0.7 
            }
        });

        return response.generated_text;
    } catch (error) {
        console.error('AI Analysis Error:', error);
        throw error;
    }
}

function getWebviewContent(analysis, dog) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                background-color: #f0f0f0; 
            }
            .analysis {
                background-color: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .dog-header {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
            }
            .dog-header img {
                width: 100px;
                margin-right: 20px;
                border-radius: 50%;
            }
        </style>
    </head>
    <body>
        <div class="dog-header">
            <img src="${dog.gif}" alt="${dog.name}">
            <h1>${dog.name}'s Code Review</h1>
        </div>
        <div class="analysis">
            <pre>${analysis}</pre>
        </div>
    </body>
    </html>
    `;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};