# does-it-suck- README  

Welcome to the **"does-it-suck-"** VS Code extension! This extension introduces an innovative way to analyze your code with the help of AI-powered dogs with unique personalities.  

---

## Features  

- **Nerd AI Dog (Fully Functional):** Provides in-depth, technical, and precise code reviews to improve your code quality.  
- **Beta Dog Models:** Explore three additional AI models—Sassy, Romantic, and Normal—for different review styles. (Currently in beta testing and may not function as expected.)  
- **Interactive Code Analysis:** Choose your preferred coding companion and let them analyze your active code with intelligent suggestions.  
- **Webview Reports:** Get detailed analysis displayed in a visually engaging webview, complete with themed elements.  

Example:
![Feature Demo](public/dogNerd.gif)  

---

## Requirements  

- **VS Code Version**: Requires VS Code 1.70.0 or later.  
- **API Access**: Ensure you have a valid Hugging Face API token for the analysis to work.  
- **Internet Connection**: Necessary for AI communication.  

---

## Getting Started  

1. **Install the Extension:**  
   Download and install the "does-it-suck-" extension from the Visual Studio Code Marketplace.  

2. **Set Your API Key:**  
   Save your Hugging Face API key in your environment variable as `HF_ACCESS_TOKEN`. Alternatively, you can modify the `HfInference` constructor directly in the code for testing.  

3. **Run the Extension:**  
   - Open a code file in VS Code.  
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and type `Does It Suck - Select Dog`.  
   - Pick your favorite AI dog companion and let them analyze your code!  

---

## Extension Settings  

This extension currently does not require configuration but will include customizable settings in future updates.  

---

## Known Issues  

- Only the **Nerd AI dog** is fully operational at this time.  
- The **Sassy**, **Romantic**, and **Normal** AI models may not work as expected.  
- Minor performance delays when analyzing large codebases.  

---

## Release Notes  

### 1.0.0  

- **Initial Beta Release**:  
  - Fully functional **Nerd AI Dog** for code analysis.  
  - Beta integration for **Sassy**, **Romantic**, and **Normal** models.  
  - Interactive code reviews with engaging webview reports.  

### Upcoming Features  

- Full support for all AI dog models.  
- Improved performance and stability.  
- Additional configuration options for personalized code analysis.  

---

## For Developers  

Want to contribute or report a bug? Check out the [GitHub Repository](#) for more details.  

---

## Enjoy Your Code Reviews!  

Bring your code to life with "does-it-suck-" and let your AI dog companions help you write better, cleaner, and smarter code!  
