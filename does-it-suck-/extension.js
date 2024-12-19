const vscode = require('vscode');
const { HfInference } = require('@huggingface/inference');
const { prompts } = require("./prompts")
const path = require('path');

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
        const response = await hf.request({
            model: dog.model,
            inputs: dog.prompt(code),
            parameters: {
                max_new_tokens: 900,
                temperature: 0.7,
                top_p: 0.9
            }
        });

        // Handle both array and single response formats
        let analysisText;
        if (Array.isArray(response)) {
            analysisText = response[0]?.generated_text || "No analysis could be generated.";
        } else if (response.generated_text) {
            analysisText = response.generated_text;
        } else {
            throw new Error("Unexpected response format from the model");
        }

        // Clean up the response by removing the prompt and code
        const cleanedAnalysis = analysisText
            // Remove everything before "Code to analyze:"
            .replace(/^[\s\S]*?Code to analyze:/i, '')
            // Remove the actual code (use the provided code as a reference)
            .replace(code, '')
            // Remove common boilerplate text
            .replace(/Code to work with:/i, '')
            .replace(/Tear this code apart[\s\S]*?paragraphs\./i, '')
            .replace(/You are a[\s\S]*?paragraphs\./i, '')
            // Split into lines and filter out empty lines and boilerplate
            .split('\n')
            .filter(line => 
                line.trim() && 
                !/No warranties|No liabilities|No legal advice|undefined|^>|^\s*\/\/|^\s*$/.test(line)
            )
            .join('\n')
            .trim();

        // If the cleaned analysis is empty, return an error message
        if (!cleanedAnalysis) {
            return "The model did not generate a meaningful analysis. Please try again.";
        }

        return cleanedAnalysis;

    } catch (error) {
        console.error('AI Analysis Error:', error);
        return `Analysis failed: ${error.message}. Please try again or select a different model.`;
    }
}

// function getWebviewContent(analysis, dog) {
//     return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <style>
//             body { 
//                 font-family: 'Cascadia Code', 'Fira Code', monospace; 
//                 line-height: 1.6;
//                 padding: 20px; 
//                 background-color: #f4f4f4;
//                 color: #333; 
//             }
//             .analysis {
//                 white-space: pre-wrap;
//                 word-wrap: break-word;
//                 background-color: white;
//                 padding: 20px;
//                 border-radius: 8px;
//                 box-shadow: 0 4px 8px rgba(0,0,0,0.1);
//             }
//             .dog-header {
//                 display: flex;
//                 align-items: center;
//                 margin-bottom: 20px;
//             }
//             .dog-header img {
//                 width: 100px;
//                 margin-right: 20px;
//                 border-radius: 50%;
//             }
//         </style>
//     </head>
//     <body>
//         <div class="dog-header">
//             <img src="${prompts.nerd.gif}" alt="${dog.name}">
//             <h1>${dog.name}'s Code Review</h1>
//         </div>
//         <div class="analysis">${analysis}</div>
//     </body>
//     </html>
//     `;
// }



// async function generateAIComments(code, dog, hf) {
//     try {
//         const response = await hf.textGeneration({
//             model: dog.model, 
//             inputs: dog.prompt(code),
//             parameters: { 
//                 max_new_tokens: 900,
//                 temperature: 0.7,
//                 top_p: 0.9
//             }
//         });

//         // Extract only the analysis/comments part
//         const analysisText = response.generated_text || "No analysis could be generated.";
        
//         // Remove the prompt and code parts
//         const cleanedAnalysis = analysisText
//             .replace(/You are a.*?Code to analyze:/s, '') // Remove the initial prompt
//             .replace(code, '') // Remove the code being analyzed
//             .split('\n')
//             .filter(line => line.trim() && 
//                           !/No warranties|No liabilities|No legal advice|undefined/i.test(line))
//             .join('\n')
//             .trim();

//         return cleanedAnalysis;
//     } catch (error) {
//         console.error('AI Analysis Error:', error);
//         return `Analysis failed: ${error.message}`;
//     }
// }

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
            <img src="${dog.gif}" alt="${dog.name}">
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