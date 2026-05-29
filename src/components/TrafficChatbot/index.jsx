import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Sparkles, Cpu, HelpCircle } from 'lucide-react';

const TrafficChatbot = ({ 
  selectedCityName, 
  selectedControllerId, 
  carsNS, 
  carsEW, 
  lotsData, 
  INDIA_CITIES, 
  activeTab 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your AI Traffic Assistant. I monitor live city telemetry in real-time. How can I help you optimize your route or parking today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const getActiveControllerName = () => {
    const city = INDIA_CITIES[selectedCityName];
    if (city) {
      const ctrl = city.controllers.find(c => c.id === selectedControllerId);
      return ctrl ? ctrl.name : 'Active Intersection';
    }
    return 'Active Intersection';
  };

  const handleSendMessage = (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const query = textToSend.toLowerCase();

    // Context analysis and response generation
    setTimeout(() => {
      let botResponse = '';
      const controllerName = getActiveControllerName();

      if (query.includes('route') || query.includes('traffic') || query.includes('congestion') || query.includes('junction') || query.includes('jam') || query.includes('less traffic')) {
        // Congestion Query
        if (carsNS < carsEW) {
          botResponse = `Currently at **${controllerName}** in **${selectedCityName}**, the North-South corridor has less traffic with **${carsNS}** queued vehicles, compared to the East-West corridor which has **${carsEW}** vehicles. I recommend taking the North-South route.`;
        } else if (carsNS > carsEW) {
          botResponse = `Currently at **${controllerName}** in **${selectedCityName}**, the East-West corridor has less traffic with **${carsEW}** queued vehicles, compared to the North-South corridor which has **${carsNS}** vehicles. I recommend taking the East-West route.`;
        } else {
          botResponse = `Currently at **${controllerName}** in **${selectedCityName}**, traffic is balanced on both corridors (about **${carsNS}** vehicles queued each). The AI scheduler is operating optimally.`;
        }
      } else if (query.includes('park') || query.includes('parking') || query.includes('slot') || query.includes('lot') || query.includes('station') || query.includes('railway')) {
        // Parking Query
        const vacancies = {};
        let bestLot = 'Lot A';
        let maxVacancies = 0;
        
        Object.entries(lotsData || {}).forEach(([lotName, slots]) => {
          const avail = (slots || []).filter(s => s.status === 'available').length;
          vacancies[lotName] = avail;
          if (avail > maxVacancies) {
            maxVacancies = avail;
            bestLot = lotName;
          }
        });

        botResponse = `Based on live sensors in **${selectedCityName}**, **${bestLot}** has the most parking vacancies (**${maxVacancies}** spaces available). Lot A has **${vacancies['Lot A'] || 0}**, Lot B has **${vacancies['Lot B'] || 0}**, and Lot C has **${vacancies['Lot C'] || 0}**. I recommend routing to **${bestLot}** for immediate parking.`;
      } else if (query.includes('peak') || query.includes('rush') || query.includes('when') || query.includes('time') || query.includes('expected')) {
        // Peak traffic hours query
        botResponse = `In **${selectedCityName}**, peak traffic is forecast today between **09:00 AM - 11:30 AM** (morning office rush) and **05:30 PM - 08:00 PM** (evening commute). I recommend enabling AI Adaptive override during these intervals to reduce queues.`;
      } else if (query.includes('ev') || query.includes('charge') || query.includes('charging') || query.includes('battery') || query.includes('plugin')) {
        // EV charging query
        let evSlots = [];
        Object.entries(lotsData || {}).forEach(([lot, slots]) => {
          (slots || []).forEach(s => {
            if (s.isEV && s.status === 'available') {
              evSlots.push(`${lot} Bay ${s.id}`);
            }
          });
        });

        if (evSlots.length > 0) {
          botResponse = `I found **${evSlots.length}** vacant EV charging slots in **${selectedCityName}**: **${evSlots.slice(0, 3).join(', ')}**. You can navigate there immediately.`;
        } else {
          botResponse = `All EV charging slots in **${selectedCityName}** are currently occupied. I will notify you as soon as a charging bay is released.`;
        }
      } else {
        // Default Fallback Response
        botResponse = `I am your IntelliPark AI traffic assistant. I can help you find less congested routes, check smart parking vacancies in **${selectedCityName}**, locate EV charging bays, or predict peak traffic times. Try asking: \n\n1. "Which route has less traffic?"\n2. "Where can I park near Railway Station?"\n3. "When is peak traffic expected?"`;
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 850);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputValue);
      setInputValue('');
    }
  };

  // Suggestion chips handler
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const suggestions = [
    "Which route has less traffic?",
    "Where can I park near Railway Station?",
    "When is peak traffic expected?",
    "Find nearest EV Charging Slot?"
  ];

  return (
    <div className="traffic-chatbot-container">
      {/* Floating Trigger Button */}
      <button 
        className={`chatbot-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="AI Traffic Assistant"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
        <span className="chatbot-trigger-pulse"></span>
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="chatbot-panel glass-panel animate-fade-in">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-logo">
              <Bot size={18} />
              <span className="status-dot pulsing" style={{ backgroundColor: 'var(--success)' }}></span>
            </div>
            <div className="chatbot-header-text">
              <h3>IntelliPark AI Assistant</h3>
              <p>Active Telemetry Hub • {selectedCityName}</p>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-message-row ${msg.sender}`}>
                <div className="chatbot-avatar">
                  {msg.sender === 'bot' ? <Bot size={12} /> : <User size={12} />}
                </div>
                <div className="chatbot-bubble">
                  {/* Parse basic markdown bold tags */}
                  <p>
                    {msg.text.split('**').map((part, idx) => 
                      idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                    )}
                  </p>
                  <span className="chatbot-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chatbot-message-row bot typing">
                <div className="chatbot-avatar">
                  <Bot size={12} />
                </div>
                <div className="chatbot-bubble typing-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="chatbot-suggestions">
            {suggestions.map((sug, idx) => (
              <button 
                key={idx} 
                className="chatbot-sug-chip" 
                onClick={() => handleSuggestionClick(sug)}
              >
                <Sparkles size={10} style={{ marginRight: '4px', color: 'var(--secondary)' }} />
                <span>{sug}</span>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <input 
              type="text" 
              className="chatbot-input" 
              placeholder="Ask me about traffic or parking..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="chatbot-send-btn"
              onClick={() => {
                handleSendMessage(inputValue);
                setInputValue('');
              }}
              disabled={!inputValue.trim()}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafficChatbot;
