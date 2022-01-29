import axios from "axios";
import React, { useState } from "react";

type Languages = "en" | "fr";

const IndexPage = () => {
  const [word, setWord] = useState("");
  const [phrases, setPhrases] = useState([]);
  const [audio, setAudio] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en" as Languages);
  const [ipa, setIpa] = useState("");

  const onSubmit = async () => {
    setLoading(true);
    const response = await axios.get(
      `http://localhost:3001/${word}/${language}`
    );
    setPhrases(response.data.phrases);
    setAudio(response.data.audioUrl);
    setIpa(response.data.ipa)
    setLoading(false);
  };

  return (
    <>
      <input
        type="text"
        placeholder="ingresa la palabra"
        onChange={(e) => setWord(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
        }}
      />

      <select
        onChange={(e) => setLanguage(e.currentTarget.value as Languages)}
        value={language}
      >
        <option value="en">English</option>
        <option value="fr">French</option>
      </select>

      <button onClick={onSubmit}>Consultar</button>
      {loading && <h1>LOADING...</h1>}
      {audio && (
        <a href={audio} target="_blank">
          descargar audio
        </a>
      )}

      {ipa && (
        <>
          <br />
          <p> - {ipa}</p>
        </>
      )}

      {phrases && (
        <ul className="list">
          {phrases.map((phrase, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: phrase }}></li>
          ))}
        </ul>
      )}

      {word && (
        <>
          <a
            href={`https://www.deepl.com/es/translator#en/es/${encodeURIComponent(
              word
            )}`}
            target="_blank"
          >
            DEEEPL
          </a>
          <br />

          <a
            href={`https://translate.google.com/?hl=es&sl=en&tl=es&text=${encodeURIComponent(
              word
            )}&op=translate`}
            target="_blank"
          >
            GOOGLE
          </a>
        </>
      )}
    </>
  );
};

export default IndexPage;
