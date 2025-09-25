from fastapi import FastAPI, HTTPException, Request, Depends, Form, UploadFile, File
from servicos.banco import Banco
from servicos.bot_api import BotAI
from jose import jwt
from dotenv import load_dotenv
import os
from typing import List
import typing
from fastapi.security.oauth2 import OAuth2PasswordBearer, OAuth2PasswordRequestForm 


import pdfplumber
import docx
from PIL import Image
import pytesseract
import io

from fastapi.responses import FileResponse

from fastapi.responses import StreamingResponse
from weasyprint import HTML, CSS
import io

from fastapi.staticfiles import StaticFiles




load_dotenv()

ouath2_scheme =  OAuth2PasswordBearer(tokenUrl="login")
resposta_do_will = None


chave_secreta = os.getenv("CHAVE_SECRETA")
app = FastAPI()
banco1 = Banco()
bot1 = BotAI()
full_text = "Teste"
#gerar_pdf= GerarDocumento()

from fastapi.middleware.cors import CORSMiddleware



# Lista de origens permitidas (ex: onde seu front-end está rodando)
origins = [
    "http://localhost:5173",  # React local,
    # Você pode adicionar mais origens se necessário (produção, etc.)
]

# Adiciona o middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Ou use ["*"] para permitir todas as origens (não recomendado em produção)
    allow_credentials=True,
    allow_methods=["*"],    # Permitir todos os métodos (GET, POST, etc)
    allow_headers=["*"],    # Permitir todos os headers
)


# Expõe a pasta "static" em /static
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.post("/login")
def login(data: OAuth2PasswordRequestForm = Depends()):
    user =  banco1.verificar_dados_user(data)
    if user:
        payload = {"user": data.username, "permissao":user[0][3]}
        token = jwt.encode(payload, chave_secreta, algorithm="HS256")
        return {"token":token, "permissao": user[0][3]}, 200
    else:
        raise HTTPException(401, "Credenciais Incorretas")
    
@app.get("/portal")
def portal(token: str = Depends(ouath2_scheme)):

    

    try:
        payload = jwt.decode(token, chave_secreta, algorithms=["HS256"])
        return {"msg": f"Olá {payload['user']}, acesso liberado!"}




    except:
        raise HTTPException(401, "Token Inválido")
    

@app.get("/administrador")
def administrador(token: str = Depends(ouath2_scheme)):
    try:
        payload = jwt.decode(token, chave_secreta, algorithms=["HS256"])

        print(payload["permissao"])
        if payload["permissao"]=="root":
            return {"msg": f"Olá Gerente {payload['user']}, acesso liberado a página de administração!"}

        else:
            raise HTTPException(403, "Acesso não autorizado")
    except:
        raise HTTPException(401, "token inválido")


@app.post("/processar_arquivos")
async def processar_arquivos(text: str = Form(...), files: List[UploadFile] = File(...)):
 extracted_texts = []

 for f in files:
        content = await f.read()

        if f.filename.endswith(".pdf"):
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                pdf_text = "\n".join([page.extract_text() or "" for page in pdf.pages])
                extracted_texts.append(pdf_text)

        elif f.filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(content))
            doc_text = "\n".join([p.text for p in doc.paragraphs])
            extracted_texts.append(doc_text)

        elif f.content_type.startswith("image/"):
            image = Image.open(io.BytesIO(content))
            img_text = pytesseract.image_to_string(image, lang="por")  # OCR português
            extracted_texts.append(img_text)

        else:
            extracted_texts.append(f"⚠️ Tipo não suportado: {f.filename}")

 # junta texto colado + texto dos arquivos
 full_text = text + "\n".join(extracted_texts)
 global resposta_do_will

 resposta_do_will = bot1.invoke(full_text)
 return {"resposta_do_will": full_text}


@app.get("/generate-pdf")
def generate_pdf():
    """
    content = HTML formatado vindo da LLM
    """
    buffer = io.BytesIO()

    # Converte HTML -> PDF
    HTML(string=resposta_do_will, base_url="http://localhost:5000").write_pdf(buffer, stylesheets=[CSS(string="""
        body { font-family: Arial, sans-serif; }
        h1   { color: #003366; text-align: center; }
        p    { font-size: 12pt; line-height: 1.4; }
    """)])

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=relatorio.pdf"}
    )




        

@app.get("/pegar_dados_do_db")
def pegar_dados_do_db(token: str = Depends(ouath2_scheme)):


    try:
        payload = jwt.decode(token, chave_secreta, algorithms=["HS256"])

        if payload["permissao"]=="root":

            usuarios_cadastro_list = []
            for usuario in banco1.usuarios_cadastro():
              usuarios_cadastro_list.append({"id": usuario[0], "nome": usuario[1], "senha": usuario[2], "permissao": usuario[3]})

            return usuarios_cadastro_list
        
        else:
            raise HTTPException(403, "Acesso não autorizado")
    except:
            raise HTTPException(401, "Token inválido")
    






@app.post("/alterar_dados_do_db")
def alterar_dados_do_db(alteracao_data: dict, token: str = Depends(ouath2_scheme)):
    
    try:
        payload = jwt.decode(token, chave_secreta, algorithms=["HS256"])
        if payload["permissao"]=="root":
            banco1.alterar_cadastro(alteracao_data["id"], alteracao_data["nome"], alteracao_data["senha"], alteracao_data["permissao"])
            return {"msg":"O cadastro foi alterado com sucesso!!!"}
        else:
            raise HTTPException(403, "Acesso não Autorizado")
    
    except:
        raise HTTPException(401, "Token inválido")
    


@app.post("/adicionar_dados_no_db")
def adicionar_dados_no_db(adicionar_data: dict, token: str = Depends(ouath2_scheme)):
    
    try:
        payload = jwt.decode(token, chave_secreta, algorithms=["HS256"])
        if payload["permissao"]=="root":
            banco1.adicionar_cadastro(adicionar_data["novoNome"], adicionar_data["novaSenha"], adicionar_data["novaPermissao"])
            return {"msg":"O cadastro foi adicionado com sucesso!!!"}

        else:
            raise HTTPException(403, "Acesso não Autorizado")
    
    except:
        raise HTTPException(401, "Token inválido")
    


@app.post("/remover_dados_no_db")
def remover_dados_no_db(remover_data: dict,  token: str = Depends(ouath2_scheme)):
    try:
        payload = jwt.decode(token, chave_secreta, algorithms=["HS256"])
        if payload["permissao"]=="root":
            banco1.remover_cadastro(remover_data["id"])
            return {"msg":"O cadastro foi removido com sucesso!!!"}
        
        else:
            raise HTTPException(403, "Acesso não Autorizado")
    
    except:
        raise HTTPException(401, "Token inválido")



