import { Component, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { StorageService } from '../services/storage.service';
import { Chat, Part, Content } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'model' | 'tool';
  text?: string;
  isTool?: boolean;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      <!-- Chat Window -->
      @if (isOpen()) {
        <div class="bg-white w-96 h-[600px] rounded-2xl shadow-2xl border border-indigo-100 flex flex-col pointer-events-auto mb-4 animate-scale-in origin-bottom-right overflow-hidden">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex items-center justify-between text-white shrink-0">
             <div class="flex items-center gap-3">
               <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                 </svg>
               </div>
               <div>
                 <h3 class="font-bold text-sm leading-tight">Ad Operator Command</h3>
                 <p class="text-[10px] text-indigo-200">Autonomous Mode Active</p>
               </div>
             </div>
             <button (click)="toggle()" class="p-1 hover:bg-white/20 rounded-md transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
          </div>

          <!-- Messages -->
          <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
            
            <div class="flex gap-3">
               <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 text-xs font-bold">AI</div>
               <div class="bg-white border border-indigo-50 p-3 rounded-2xl rounded-tl-none text-sm text-slate-700 shadow-sm">
                 Ad Operator Initialized. I have full control over navigation and project creation. What's the plan?
               </div>
            </div>

            @for (msg of messages(); track $index) {
              @if (msg.role === 'user') {
                 <div class="flex gap-3 flex-row-reverse">
                   <div class="bg-indigo-600 p-3 rounded-2xl rounded-tr-none text-sm text-white shadow-sm max-w-[85%]">
                     {{ msg.text }}
                   </div>
                 </div>
              } @else {
                 <div class="flex gap-3">
                   <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 text-xs font-bold">AI</div>
                   <div class="bg-white border border-indigo-50 p-3 rounded-2xl rounded-tl-none text-sm text-slate-700 shadow-sm max-w-[90%] whitespace-pre-wrap">
                     @if (msg.isTool) {
                       <div class="flex items-center gap-2 text-indigo-600 italic font-medium bg-indigo-50 px-2 py-1 rounded">
                         <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                         {{ msg.text }}
                       </div>
                     } @else {
                       {{ msg.text }}
                     }
                   </div>
                 </div>
              }
            }
            
            @if (isThinking()) {
              <div class="flex gap-3">
                 <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 text-xs font-bold">AI</div>
                 <div class="bg-white border border-indigo-50 p-3 rounded-2xl rounded-tl-none text-sm text-slate-500 shadow-sm flex items-center gap-2">
                   <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                   <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                   <span class="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                 </div>
              </div>
            }
          </div>

          <!-- Input -->
          <div class="p-3 bg-white border-t border-slate-100 flex items-end gap-2 shrink-0">
             <textarea 
               [(ngModel)]="userInput" 
               (keydown.enter)="$event.preventDefault(); sendMessage()"
               rows="1" 
               placeholder="Type a command..." 
               class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none max-h-24 custom-scrollbar"
             ></textarea>
             <button (click)="sendMessage()" [disabled]="!userInput().trim() || isThinking()" class="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
               </svg>
             </button>
          </div>
        </div>
      }

      <!-- Floating Button -->
      <button 
        (click)="toggle()" 
        class="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full shadow-xl shadow-indigo-500/40 flex items-center justify-center transition-transform hover:scale-105 pointer-events-auto border-2 border-white/20 active:scale-95"
      >
         @if (isOpen()) {
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
             <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
           </svg>
         } @else {
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7">
             <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
           </svg>
         }
      </button>

    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-scale-in { animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class AiAssistantComponent {
  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  userInput = signal('');
  isThinking = signal(false);
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  geminiService = inject(GeminiService);
  storageService = inject(StorageService);

  private chatSession: Chat | null = null;
  
  toggle() {
    this.isOpen.update(v => !v);
    if (this.isOpen() && !this.chatSession) {
      this.initSession();
    }
    setTimeout(() => this.scrollToBottom(), 100);
  }

  private initSession() {
    const context = this.getScreenContext();
    this.chatSession = this.geminiService.initChat(context);
  }

  private getScreenContext(): string {
    const projects = this.storageService.projects();
    const currentView = this.storageService.currentView();
    
    return `
      Current View: ${currentView}
      Total Projects: ${projects.length}
      Project Names: ${projects.map(p => p.name).join(', ')}
    `;
  }

  async sendMessage() {
    if (!this.userInput().trim() || !this.chatSession) return;

    const userText = this.userInput();
    this.userInput.set(''); // Clear input immediately
    this.messages.update(m => [...m, { role: 'user', text: userText }]);
    this.isThinking.set(true);
    this.scrollToBottom();

    try {
      // 1. Send User Message
      let response = await this.chatSession.sendMessage(userText);
      
      // 2. Loop for Tool Calls
      let functionCalls = response.candidates?.[0]?.content?.parts?.filter(p => !!p.functionCall);

      while (functionCalls && functionCalls.length > 0) {
        // Collect responses as proper Part objects
        const functionResponses: Part[] = [];
        
        for (const part of functionCalls) {
          const call = part.functionCall;
          if (!call || !call.name) continue;

          // UI Feedback
          this.messages.update(m => [...m, { 
            role: 'tool', 
            text: `Executing: ${call.name}`, 
            isTool: true 
          }]);
          this.scrollToBottom();

          // Execute tool
          let result: any;
          try {
             result = await this.geminiService.executeTool(call.name, call.args);
          } catch (e: any) {
             result = { error: e.message || 'Tool execution failed' };
          }
          
          // Construct valid response part
          // IMPORTANT: Sanitize result to ensure it's a plain JSON object and strictly serializable
          const sanitizedResult = JSON.parse(JSON.stringify(result || {}));

          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: { result: sanitizedResult } 
            }
          });
        }

        // Send results back to model if we have any
        if (functionResponses.length > 0) {
           // Explicitly wrap in Content object with 'tool' role to avoid ContentUnion errors in strict SDKs
           const toolResponse: Content = {
             role: 'tool',
             parts: functionResponses
           };
           
           response = await this.chatSession.sendMessage(toolResponse);
           
           // Check if the model wants to call MORE tools (multi-turn tool use)
           functionCalls = response.candidates?.[0]?.content?.parts?.filter(p => !!p.functionCall);
        } else {
           functionCalls = []; 
        }
      }

      // 3. Final Text Response
      const botText = response.text;
      if (botText) {
        this.messages.update(m => [...m, { role: 'model', text: botText }]);
      }

    } catch (e: any) {
      console.error('Chat Error:', e);
      let errorMessage = 'I lost connection to the agent. Please try again.';
      if (e.message && e.message.includes('Safety')) errorMessage = 'The response was blocked by safety filters.';
      if (e.message && e.message.includes('ContentUnion')) errorMessage = 'Error: Internal message format error. Resetting chat...';
      
      this.messages.update(m => [...m, { role: 'model', text: errorMessage }]);
      // If fatal error, maybe reset session
      if (e.message && e.message.includes('ContentUnion')) {
         this.chatSession = null;
      }
    } finally {
      this.isThinking.set(false);
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    if (this.scrollContainer) {
      setTimeout(() => {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }, 50);
    }
  }
}
