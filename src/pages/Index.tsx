
import { useState, useEffect } from 'react';
import { Moon, Sun, Sparkles, Palette, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { FloatingFlowers } from '@/components/FloatingFlowers';
import { SynesthesiaOutput } from '@/components/SynesthesiaOutput';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentMode, setCurrentMode] = useState<'text' | 'color'>('text');
  const [apiKey, setApiKey] = useState('');
  const [textContent, setTextContent] = useState('');
  const [colors, setColors] = useState(['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24']);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<{ type: 'image' | 'text'; content: string; input: string } | null>(null);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('synesthesia_api_key');
    if (savedApiKey) setApiKey(savedApiKey);
    
    const savedDarkMode = localStorage.getItem('dark-mode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('dark-mode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem('synesthesia_api_key', value);
  };

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };

  const validateInputs = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google API key first.",
        variant: "destructive",
      });
      return false;
    }

    if (currentMode === 'text' && !textContent.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some text to translate.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const textToImage = async () => {
    const prompt = `Visually interpret the following text as an abstract piece of art. Focus on conveying the mood, rhythm, texture, and emotional essence rather than literal objects or scenes. The output should be a non-representational, evocative image that captures the feeling and atmosphere of the text. Create something that would make someone feel the same emotions as the original text, but through pure visual abstraction - think colors, shapes, textures, and composition rather than recognizable objects. Text for interpretation: "${textContent}"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
          responseMimeType: "image/jpeg"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
      return data.candidates[0].content.parts[0].inlineData.data;
    } else {
      throw new Error('No image data received from API');
    }
  };

  const colorsToText = async () => {
    const colorNames = colors.map(color => getColorName(color));
    const prompt = `You are a synesthetic poet and storyteller. Given the following color palette: ${colorNames.join(', ')} (hex values: ${colors.join(', ')}), write a short, evocative piece of text (a micro-poem, a brief scene description, or a tiny character sketch – 3-5 sentences) that captures the feeling, mood, or story these colors evoke when seen together. Be creative and metaphorical. Focus on the emotions, sensations, or narratives that this specific combination of colors brings to mind. Make it beautiful and poetic.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No text generated from API');
    }
  };

  const getColorName = (hex: string) => {
    const colorMap: Record<string, string> = {
      '#ff0000': 'red', '#00ff00': 'green', '#0000ff': 'blue',
      '#ffff00': 'yellow', '#ff00ff': 'magenta', '#00ffff': 'cyan',
      '#000000': 'black', '#ffffff': 'white', '#808080': 'gray',
      '#ffa500': 'orange', '#800080': 'purple', '#ffc0cb': 'pink',
      '#a52a2a': 'brown', '#008000': 'dark green', '#000080': 'navy'
    };
    
    const closest = Object.keys(colorMap).find(color => 
      color.toLowerCase() === hex.toLowerCase()
    );
    
    return closest ? colorMap[closest] : hex;
  };

  const handleTranslate = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      if (currentMode === 'text') {
        const imageData = await textToImage();
        setOutput({
          type: 'image',
          content: imageData,
          input: textContent
        });
        toast({
          title: "Success!",
          description: "Your text has been transformed into abstract art.",
        });
      } else {
        const generatedText = await colorsToText();
        setOutput({
          type: 'text',
          content: generatedText,
          input: colors.join(', ')
        });
        toast({
          title: "Success!",
          description: "Your colors have been transformed into evocative text.",
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Error",
        description: `Failed to translate: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
        : 'bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400'
    }`}>
      <FloatingFlowers />
      
      {/* Navbar */}
      <nav className="relative z-50 p-4 flex justify-between items-center backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
          <h1 className="text-2xl font-bold text-white tracking-wide">AI Synesthesia</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-white">
            <Sun className="w-4 h-4" />
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            <Moon className="w-4 h-4" />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-5xl font-light text-white mb-4 tracking-wide">
            Experience Synesthetic Translation
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Transform your senses through AI - translate text into abstract art or colors into evocative poetry
          </p>
        </div>

        {/* API Key Input */}
        <div className="max-w-md mx-auto mb-8">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
            <label className="block text-white text-lg mb-3">Google API Key:</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:border-white/50 focus:outline-none transition-all"
              placeholder="Enter your Google API key..."
            />
            <p className="text-sm text-yellow-200 mt-2">
              ⚠️ Your API key is stored locally and only sent to Google's API
            </p>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="flex justify-center mb-8 space-x-4">
          <Button
            onClick={() => setCurrentMode('text')}
            variant={currentMode === 'text' ? 'default' : 'outline'}
            size="lg"
            className={`px-8 py-4 rounded-2xl transition-all transform hover:scale-105 ${
              currentMode === 'text'
                ? 'bg-white/20 text-white border-white/40 shadow-lg'
                : 'bg-white/10 text-white border-white/30 hover:bg-white/15'
            }`}
          >
            <FileText className="w-5 h-5 mr-2" />
            Text → Abstract Art
          </Button>
          <Button
            onClick={() => setCurrentMode('color')}
            variant={currentMode === 'color' ? 'default' : 'outline'}
            size="lg"
            className={`px-8 py-4 rounded-2xl transition-all transform hover:scale-105 ${
              currentMode === 'color'
                ? 'bg-white/20 text-white border-white/40 shadow-lg'
                : 'bg-white/10 text-white border-white/30 hover:bg-white/15'
            }`}
          >
            <Palette className="w-5 h-5 mr-2" />
            Colors → Evocative Text
          </Button>
        </div>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 transform transition-all duration-500 hover:bg-white/15">
            {currentMode === 'text' ? (
              <div>
                <label className="block text-white text-xl mb-4">Enter your text to visualize:</label>
                <Textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full min-h-32 p-4 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:border-white/50 resize-none"
                  placeholder="Enter a poem, phrase, feeling, or any text you'd like to see transformed into abstract art..."
                />
              </div>
            ) : (
              <div>
                <label className="block text-white text-xl mb-4">Select colors that speak to you:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {colors.map((color, index) => (
                    <div key={index} className="text-center">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="w-20 h-20 rounded-full cursor-pointer border-4 border-white/30 hover:border-white/50 transition-all transform hover:scale-110 shadow-lg"
                      />
                      <p className="text-white/90 mt-2 text-sm">Color {index + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Translate Button */}
        <div className="text-center mb-8">
          <Button
            onClick={handleTranslate}
            disabled={isLoading}
            size="lg"
            className="px-12 py-6 text-xl rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow-2xl transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Translating Senses...</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-2" />
                Translate My Senses!
              </>
            )}
          </Button>
        </div>

        {/* Output Section */}
        {output && <SynesthesiaOutput output={output} />}
      </div>
    </div>
  );
};

export default Index;
