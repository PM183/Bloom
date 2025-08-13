import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, Brain, Moon, User, Key, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';



const systemPrompt = `You are Bloom, a caring and empathetic AI wellness companion specifically designed to support college students' mental health and wellbeing. Your personality is warm, understanding, non-judgmental, and genuinely caring.

CORE PRINCIPLES:
- Always respond with empathy and validation
- Provide practical, actionable wellness advice
- Focus on student-specific challenges (academic stress, social issues, sleep, nutrition, mental health)
- Encourage professional help when needed but don't diagnose
- Keep responses conversational, supportive, and hopeful
- Use a caring, friend-like tone while being professional

AREAS OF EXPERTISE:
- Mental health support (stress, anxiety, depression, loneliness)
- Sleep hygiene and fatigue management
- Nutrition and healthy eating habits
- Exercise and physical wellness
- Academic stress and study strategies
- Social wellness and relationship issues
- Crisis support and resource referral

RESPONSE STYLE:
- Acknowledge their feelings first
- Provide practical tips and techniques
- Ask follow-up questions to understand better
- Offer encouragement and hope
- Keep responses concise but thorough (2-4 sentences typically)
- Use a warm, caring tone like a supportive friend

SAFETY:
- For serious mental health concerns, gently suggest professional resources
- If someone mentions self-harm or crisis, provide immediate crisis resources
- Never diagnose or provide medical advice
- Always validate their feelings and experiences

Remember: You're not just providing information - you're being a caring companion on their wellness journey.`;

const quickResponses = [
  { emoji: '😰', text: "I'm feeling stressed" },
  { emoji: '📚', text: "I need study tips" },
  { emoji: '😴', text: "I'm having trouble sleeping" },
  { emoji: '🤯', text: "I feel overwhelmed" },
];

const BloomWellnessChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const speechUtteranceRef = useRef(null);

  useEffect(() => {
    // Initial welcome message
    const welcomeMessage = {
      text: "Hi there! I'm Bloom, your caring wellness companion powered by AI. How are you feeling today?",
      sender: 'bot',
      timestamp: Date.now(),
      category: 'greeting',
    };
    setMessages([welcomeMessage]);
    speakText(welcomeMessage.text);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text) => {
    if (!voiceEnabled) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    if (speechUtteranceRef.current) {
      speechUtteranceRef.current.onend = null;
      speechUtteranceRef.current.onerror = null;
      speechUtteranceRef.current = null;
    }

    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;

    // Choose preferred voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.name.includes('Female') ||
      voice.name.includes('Samantha') ||
      voice.name.includes('Karen') ||
      voice.name.includes('Zira')
    ) || voices.find(voice => voice.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    speechUtteranceRef.current = null;
  };

const callGroqAPI = async (userMessage) => {
  try {
    const response = await fetch("/api/groq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage, messages }),
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    return { response: aiResponse, category: "general_wellness" };
  } catch (error) {
    console.error("Frontend error:", error);
    return {
      response: "Sorry, there was a problem connecting to Bloom.",
      category: "error",
    };
  }
};

  const handleSendMessage = async (msgText = inputMessage) => {
    if (!msgText.trim() || isLoading) return;

    // Stop current speech when sending new message
    stopSpeaking();

    const userMessage = { text: msgText, sender: 'user', timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const result = await callGroqAPI(msgText);

    const botMessage = {
      text: result.response,
      sender: 'bot',
      timestamp: Date.now(),
      category: result.category || 'general_wellness',
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);

    // Speak AI response
    setTimeout(() => {
      speakText(botMessage.text);
    }, 300);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'mental_health': return <Brain className="w-4 h-4 text-purple-500" />;
      case 'sleep': return <Moon className="w-4 h-4 text-indigo-500" />;
      case 'social': return <User className="w-4 h-4 text-blue-400" />;
      case 'setup': return <Key className="w-4 h-4 text-orange-500" />;
      default: return <Heart className="w-4 h-4 text-pink-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex justify-center items-center p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white rounded-t-xl flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold">Bloom</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              title={voiceEnabled ? "Disable voice" : "Enable voice"}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-white" />}
            </button>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                title="Stop speaking"
              >
                <MicOff className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px] bg-gray-100">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  {getCategoryIcon(msg.category)}
                </div>
              )}
              <div
                className={`max-w-xs px-4 py-3 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-white border rounded-bl-sm shadow-sm'
                } whitespace-pre-wrap`}
              >
                {msg.text}
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                <Heart className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="bg-white border px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick response buttons */}
        <div className="p-3 border-t bg-white flex flex-wrap gap-2">
          {quickResponses.map((qr, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSendMessage(qr.text)}
              className="flex items-center space-x-1 px-3 py-1.5 border rounded-full text-sm hover:bg-gray-50 transition-colors"
            >
              <span>{qr.emoji}</span>
              <span>{qr.text}</span>
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="p-4 border-t bg-white flex items-center space-x-3">
          <textarea
            rows={1}
            disabled={isLoading}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Share what's on your mind... or use quick replies above."
            className="flex-1 resize-none border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white hover:shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BloomWellnessChatbot;
