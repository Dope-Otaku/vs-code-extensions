const vscode = require('vscode');
const { HfInference } = require('@huggingface/inference');
const { prompts } = require("./prompts")

const dogs = {
    nerd: prompts.nerd,
    sassy: prompts.sassy,
    romantic: prompts.romantic,
    normal: prompts.normal
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


// export function activate(context) {
//     const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

//     let disposable = vscode.commands.registerCommand('does-it-suck-.selectDog', async () => {
//         const dogNames = Object.keys(dogs).map((key) => dogs[key].name);
//         const selectedDogName = await vscode.window.showQuickPick(dogNames, {
//             placeHolder: "Choose your coding companion",
//         });

//         const selectedDog = Object.values(dogs).find(dog => dog.name === selectedDogName);
//         if (selectedDog) {
//             await analyzeCode(selectedDog, hf);
//         }
//     });

//     context.subscriptions.push(disposable);
// }

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
                `${dog.name}'s Code Review`,
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
        // Validate code to prevent inappropriate content
        // if (containsInappropriateContent(code)) {
        //     return "🚫 Inappropriate content detected. Please submit a meaningful code sample.";
        // }

        const response = await hf.textGeneration({
            model: dog.model, 
            inputs: dog.prompt(code),
            parameters: { 
                max_new_tokens: 900,
                temperature: 0.7,
                top_p: 0.9
            }
        });

        // Clean up repetitive or irrelevant content
        const analysisText = response.generated_text || "No analysis could be generated.";
        return analysisText
            .split("\n")
            .filter(line => !/No warranties|No liabilities|No legal advice|undefined/i.test(line))
            .join("\n")
            .trim();
    } catch (error) {
        console.error('AI Analysis Error:', error);
        return `Analysis failed: ${error.message}`;
    }
}

function containsInappropriateContent(code) {
    // Basic inappropriate content check
    const inappropriatePatterns = [
        /shit/gi,
        /fuck/gi,
        /damn/gi,
        /crap/gi
    ];

    return inappropriatePatterns.some(pattern => pattern.test(code));
}

function getWebviewContent(analysis, dog) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
                font-family: 'Cascadia Code', 'Fira Code', monospace; 
                line-height: 1.6;
                padding: 20px; 
                background-color: #f4f4f4;
                color: #333; 
            }
            .analysis {
                white-space: pre-wrap;
                word-wrap: break-word;
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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
            <img src="${prompts.nerd.gif}" alt="${dog.name}">
            <h1>${dog.name}'s Code Review</h1>
        </div>
        <div class="analysis">${analysis}</div>
    </body>
    </html>
    `;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};