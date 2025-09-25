import './portal.css'
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

function Portal() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");


  const [botaoAdm, setBotaoAdm] = useState(false)

  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [ativarDownload, setAtivarDownload] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 Verificação de acesso
  const acessar_portal = async () => {
    try {
      const response = await fetch("http://localhost:5000/portal", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(await response.json());
    } catch (erro) {
      console.log(`Erro no front-end acessar_portal: ${erro}`);
      navigate("/login");
    }
  };

  const setarBotaoAdm = ()=> {
    if (localStorage.getItem("permissao")=="root"){
         setBotaoAdm(true)
    }
  }

  useEffect(() => {
    setarBotaoAdm();
    acessar_portal();
  }, []);

  // 🔹 Eventos básicos
  const handleTextChange = (e) => setText(e.target.value);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // 🔹 Processar arquivos/texto
  const processar_arquivos = async () => {
    if (!text && files.length === 0) {
      alert("Nada para enviar!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("text", text);
    files.forEach((f) => formData.append("files", f));

    try {
      const response = await fetch("http://localhost:5000/processar_arquivos", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Erro no upload");

      const data = await response.json();
      console.log("Resposta do servidor:", data);

      alert("Upload concluído com sucesso!");
      setAtivarDownload(true);
    } catch (erro) {
      console.log(erro);
      alert(`Falha no upload: ${erro.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Download PDF
  const downloadPDF = async () => {
    const response = await fetch("http://localhost:5000/generate-pdf");

    if (!response.ok) {
      alert("Erro ao gerar PDF");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // 🔹 Drag & Drop
  useEffect(() => {
    const preventDefaults = (e) => e.preventDefault();
    window.addEventListener("dragover", preventDefaults);
    window.addEventListener("drop", preventDefaults);
    return () => {
      window.removeEventListener("dragover", preventDefaults);
      window.removeEventListener("drop", preventDefaults);
    };
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const dt = e.dataTransfer;
    if (dt?.files && dt.files.length > 0) {
      const dropped = Array.from(dt.files);

      const allowedFiles = dropped.filter(
        (f) =>
          f.type.startsWith("image/") ||
          f.type === "application/pdf" ||
          f.type === "application/msword" ||
          f.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );

      if (allowedFiles.length === 0) {
        setError("Nenhum arquivo válido (PDF, Word ou imagem).");
        return;
      }

      setError("");
      setFiles((prev) => [...prev, ...allowedFiles]);
      dt.clearData();
      return;
    }

    const droppedText = dt?.getData?.("text/plain");
    if (droppedText) {
      setText((prev) => (prev ? prev + "\n" : "") + droppedText);
    }
  }, []);

  // 🔹 Remover arquivo individual
  const removeFile = (index) => {
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0 && !text) {
        setAtivarDownload(false);
      }
      return updated;
    });
  };

  // 🔹 Reset para estado inicial (profissional)
  const handleReset = () => {
    setFiles([]);
    setText("");
    setAtivarDownload(false);
    setError("");
    setIsDragging(false);
  };

  return (
    <>
      {botaoAdm ? 
          (<button className='botaoAdm' onClick={()=>{navigate('/administrador')}}>Acessar Gestão</button>)
          : 
      ''}
      <div>
        <h1>A página do Portal foi acessada</h1>
      </div>

      <div className="container_portal">
        {/* Textarea */}
        <div>
          <textarea
            value={text}
            placeholder="Coloque o Texto Aqui"
            onChange={handleTextChange}
            className="upload-textarea"
          />
        </div>

        {/* Input arquivos */}
        <div>
          <label className="file-label">
            <span>Escolher arquivo</span>
            <input
              type="file"
              accept=".pdf, .docx, .doc, image/*"
              onChange={handleFileChange}
              className="file-input"
              multiple
            />
          </label>
        </div>

        {/* Área Drag & Drop */}
        <div
          className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
          onDragOver={onDragOver}
          onDragEnter={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          Arraste e solte seus arquivos aqui
        </div>

        {error && <p className="error">{error}</p>}

        {/* Preview */}
        <div className="upload-preview">
          {text && (
            <p>
              <b>Texto colado:</b> {text.slice(0, 100)}
              {text.length > 100 ? "..." : ""}
            </p>
          )}

          {files.length > 0 && (
            <div>
              <b>Arquivos selecionados:</b>
              <ul>
                {files.map((f, i) => (
                  <li key={i}>
                    {f.name}{" "}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="remove-btn"
                    >
                      ❌
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!text && files.length === 0 && (
            <p className="placeholder">Nenhum conteúdo enviado ainda</p>
          )}
        </div>

        {/* Botões */}
        <div className="processar_baixar_arquivos">
          {ativarDownload ? (
            <div className='processar_arquivos_download_pdf'>
              <button className="processar_arquivos_btn" onClick={handleReset}>
                processar mais arquivos...
              </button>
              <button className="download_pdf" onClick={downloadPDF}>
                Baixar em PDF
              </button>
            </div>
          ) : (
            <button
              className="processar_arquivos_btn"
              onClick={processar_arquivos}
              disabled={loading}
            >
              {loading ? "Processando..." : "Processar"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Portal;
