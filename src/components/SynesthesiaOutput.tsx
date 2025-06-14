
interface SynesthesiaOutputProps {
  output: {
    type: 'image' | 'text';
    content: string;
    input: string;
  };
}

export const SynesthesiaOutput = ({ output }: SynesthesiaOutputProps) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl">
        <div className="mb-6">
          <h3 className="text-2xl font-light text-white mb-4">Your Input:</h3>
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            {output.type === 'image' ? (
              <p className="text-white/90 italic">"{output.input}"</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {output.input.split(', ').map((color, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white/30 shadow-lg"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-white/90 text-sm">{color}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-light text-white mb-4">AI's Synesthetic Interpretation:</h3>
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            {output.type === 'image' ? (
              <img
                src={`data:image/jpeg;base64,${output.content}`}
                alt="AI Generated Abstract Art"
                className="max-w-full h-auto rounded-lg shadow-2xl mx-auto transform hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="text-white/90 text-lg leading-relaxed italic font-light">
                {output.content}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
