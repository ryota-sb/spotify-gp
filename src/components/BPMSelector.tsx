interface Props {
  minBPM: number;
  maxBPM: number;
  setMinBPM: (value: number) => void;
  setMaxBPM: (value: number) => void;
}

const BPMSelector = ({ minBPM, maxBPM, setMinBPM, setMaxBPM }: Props) => {
  const handleMinBPMChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectMinBPM = parseInt(event.target.value);
    setMinBPM(selectMinBPM);
  };

  const handleMaxBPMChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectMaxBPM = parseInt(event.target.value);
    setMaxBPM(selectMaxBPM);
    console.log(parseInt(event.target.value));
  };

  return (
    <div className="flex justify-center gap-3">
      <label>Min BPM:</label>
      <select value={minBPM} onChange={handleMinBPMChange}>
        {Array.from({ length: maxBPM - 79 }, (_, index) => (
          <option key={80 + index} value={80 + index}>
            {80 + index}
          </option>
        ))}
      </select>

      <label>Max BPM:</label>
      <select value={maxBPM} onChange={handleMaxBPMChange}>
        {Array.from({ length: 181 - minBPM }, (_, index) => (
          <option key={minBPM + index} value={minBPM + index}>
            {minBPM + index}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BPMSelector;
