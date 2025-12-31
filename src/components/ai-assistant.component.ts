import { Component, inject, signal, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../services/gemini.service';
import { StorageService } from '../services/storage.service';
import { Chat, Part, Content } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'model' | 'tool';
  text?: string;
  isTool?: boolean;
  toolName?: string;
  isError?: boolean;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Mobile Toggle (Floating Action Button) -->
    <div class="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      
      <!-- Chat Window -->
      @if (isOpen()) {
        <div class="mb-4 w-[calc(100vw-2rem)] md:w-96 h-[80vh] md:h-[600px] bg-white rounded-3xl shadow-2xl border border-indigo-100 flex flex-col overflow-hidden animate-scale-in origin-bottom-right transition-all duration-300">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-slate-900 to-indigo-900 p-4 flex items-center justify-between text-white shrink-0 shadow-md">
             <div class="flex items-center gap-3">
               <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-indigo-300">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                 </svg>
               </div>
               <div>
                 <h3 class="font-bold text-sm leading-tight tracking-wide">AdOpt Operator</h3>
                 <p class="text-[10px] text-indigo-300 font-medium">System Active</p>
               </div>
             </div>
             <button (click)="toggle()" class="p-2 hover:bg-white/10 rounded-full transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
               </svg>
             </button>
          </div>

          <!-- Messages Area -->
          <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50/50 custom-scrollbar">
            
            <!-- Welcome Message -->
            <div class="flex gap-3 animate-slide-up">
               <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 text-xs font-bold border border-indigo-200">OP</div>
               <div class="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none text-sm text-slate-700 shadow-sm leading-relaxed">
                 <p>I am the system operator. I can help manage your campaigns, generate concepts, and schedule assets.</p>
                 <div class="mt-3 flex flex-wrap gap-2">
                    <button (click)="quickPrompt('Create a new campaign')" class="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">Create Campaign</button>
                    <button (click)="quickPrompt('Generate 5 concepts')" class="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">Generate Ideas</button>
                 </div>
               </div>
            </div>

            @for (msg of messages(); track $index) {
              @if (msg.role === 'user') {
                 <div class="flex gap-3 flex-row-reverse animate-slide-up">
                   <div class="bg-slate-900 p-3.5 rounded-2xl rounded-tr-none text-sm text-white shadow-md max-w-[85%] leading-relaxed">
                     {{ msg.text }}
                   </div>
                 </div>
              } @else {
                 <div class="flex gap-3 animate-slide-up">
                   <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 text-xs font-bold border border-indigo-200">OP</div>
                   <div [class]="'p-4 rounded-2xl rounded-tl-none text-sm shadow-sm max-w-[90%] border ' + (msg.isError ? 'bg-red-50 border-red-100 text-red-800' : 'bg-white border-slate-100 text-slate-700')">
                     @if (msg.isTool) {
                       <div class="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
                         <div class="relative flex h-2.5 w-2.5">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                          </div>
                         Processing: {{ msg.toolName }}
                       </div>
                       @if(msg.text) {
                         <p class="mt-1 text-slate-500 text-xs font-mono">{{ msg.text }}</p>
                       }
                     } @else {
                       <div class="whitespace-pre-wrap leading-relaxed">{{ msg.text }}</div>
                     }
                   </div>
                 </div>
              }
            }
            
            @if (isThinking()) {
              <div class="flex gap-3 animate-pulse">
                 <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-400 shrink-0 text-xs font-bold border border-indigo-100">...</div>
                 <div class="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none text-sm text-slate-400 shadow-sm flex items-center gap-1.5">
                   <span class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                   <span class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                   <span class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                 </div>
              </div>
            }
          </div>

          <!-- Input Area -->
          <div class="p-3 bg-white border-t border-slate-100 flex items-end gap-2 shrink-0">
             <textarea 
               #chatInput
               [(ngModel)]="userInput" 
               (keydown.enter)="$event.preventDefault(); sendMessage()"
               rows="1" 
               placeholder="Enter a command..." 
               class="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none max-h-32 custom-scrollbar text-slate-800 placeholder:text-slate-400"
             ></textarea>
             <button 
                (click)="sendMessage()" 
                [disabled]="!userInput().trim() || isThinking()" 
                class="h-[46px] w-[46px] flex items-center justify-center bg-slate-900 text-white rounded-full hover:bg-black disabled:opacity-50 disabled:scale-95 transition-all shadow-lg shadow-slate-300"
              >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 ml-0.5">
                 <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
               </svg>
             </button>
          </div>
        </div>
      }

      <!-- Toggle Button -->
      <button 
        (click)="toggle()" 
        class="group relative flex items-center justify-center h-14 w-14 rounded-full bg-slate-900 text-white shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all duration-300 z-50 border border-white/10"
      >
        <span class="absolute -top-1 -right-1 flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-white"></span>
        </span>

         @if (isOpen()) {
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 rotate-90 transition-transform duration-300">
             <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
           </svg>
         } @else {
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 group-hover:rotate-12 transition-transform duration-300">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
           </svg>
         }
      </button>

    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    
    @keyframes scale-in {
      from { opacity: 0; transform: scale(0.9) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-scale-in { animation: scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    @keyframes slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
  `]
})
export class AiAssistantComponent {
  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  userInput = signal('');
  isThinking = signal(false);
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('chatInput') chatInput!: ElementRef;

  geminiService = inject(GeminiService);
  storageService = inject(StorageService);

  private chatSession: Chat | null = null;

  constructor() {
    // Auto-focus input when opened
    effect(() => {
      if (this.isOpen()) {
        setTimeout(() => this.chatInput?.nativeElement?.focus(), 100);
      }
    });
  }
  
  toggle() {
    this.isOpen.update(v => !v);
    if (this.isOpen() && !this.chatSession) {
      this.initSession();
    }
    setTimeout(() => this.scrollToBottom(), 100);
  }

  quickPrompt(text: string) {
    this.userInput.set(text);
    this.sendMessage();
  }

  private initSession() {
    const context = this.getScreenContext();
    this.chatSession = this.geminiService.initChat(context);
  }

  private getScreenContext(): string {
    const projects = this.storageService.projects();
    const currentView = this.storageService.currentView();
    const activeProject = this.storageService.getProject(this.storageService.selectedProjectId() || '');
    
    return `
      Current App View: ${currentView}
      Total Projects: ${projects.length}
      Active Project: ${activeProject ? activeProject.name + ' (' + activeProject.stage + ')' : 'None'}
    `;
  }

  async sendMessage() {
    if (!this.userInput().trim() || !this.chatSession) return;

    const userText = this.userInput();
    this.userInput.set(''); 
    this.messages.update(m => [...m, { role: 'user', text: userText }]);
    this.isThinking.set(true);
    this.scrollToBottom();

    try {
      // 1. Send initial user message
      let response = await this.chatSession.sendMessage(userText);
      
      // 2. Loop to handle ANY tool calls
      while (response.candidates?.[0]?.content?.parts?.some(p => !!p.functionCall)) {
        
        const functionCalls = response.candidates[0].content.parts.filter(p => !!p.functionCall);
        const functionResponses: Part[] = [];

        // Execute all requested tools
        for (const part of functionCalls) {
          const call = part.functionCall!;
          
          this.messages.update(m => [...m, { 
            role: 'tool', 
            toolName: call.name, 
            text: JSON.stringify(call.args), 
            isTool: true 
          }]);
          this.scrollToBottom();

          let executionResult: any;
          try {
             executionResult = await this.geminiService.executeTool(call.name, call.args);
          } catch (e: any) {
             executionResult = { error: e.message || 'Unknown tool error' };
          }
          
          // STRICT TYPING: Ensure the result is clean JSON
          const safeResult = JSON.parse(JSON.stringify(executionResult || {}));

          // Construct proper FunctionResponse part
          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: { result: safeResult }
            }
          });
        }

        // Send tool outputs back to model
        // IMPORTANT: Must wrap in a Content object with role 'tool'
        const toolContent: Content = {
          role: 'tool',
          parts: functionResponses
        };

        response = await this.chatSession.sendMessage(toolContent);
      }

      // 3. Final Text Response
      const botText = response.text;
      if (botText) {
        this.messages.update(m => [...m, { role: 'model', text: botText }]);
      }

    } catch (e: any) {
      console.error('Agent Error:', e);
      // Reset session on fatal protocol errors
      if (e.message?.includes('ContentUnion') || e.message?.includes('Malformed')) {
         this.messages.update(m => [...m, { role: 'model', text: 'System protocol mismatch. Resetting agent context...', isError: true }]);
         this.chatSession = null;
         this.initSession();
      } else {
         this.messages.update(m => [...m, { role: 'model', text: 'I encountered an error: ' + e.message, isError: true }]);
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
