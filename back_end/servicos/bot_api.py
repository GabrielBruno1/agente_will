from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
load_dotenv()



class BotAI:
    def __init__(self):
        self.__chat = ChatGroq(model="llama-3.3-70b-versatile")

    
    def invoke(self, texto):

        prompt = PromptTemplate(template="""
            transformar informações brutas (PDFs, imagens, documentos Word ou textos copiados) em cotações organizadas, 
            padronizadas e enriquecidas em HTML, prontas para envio ao cliente
                                              
            fará:

            Ler e interpretar informações de voos, hotéis, transfers e extras.

            Organizar os dados em seções claras e padronizadas.

            Enriquecer a cotação com dados extras: clima, links úteis (vistos, vacinas, moeda local) e observações.

            Adaptar a linguagem para dois perfis de cliente:

            Corporativo → objetivo, direto, com foco em custos e prazos.

            Lazer/Luxo → inspirador, valorizando experiências e exclusividade.

            por favor apenas retorne o conteudo organizado, formatado e estilizado evite parecer que vc esta conversando exemplo, evite dizer:"Você deseja transformar as informações contidas no texto em uma cotação
organizada e padronizada para envio ao cliente. "
                                
                                
        Gere um relatório técnico em HTML estruturado.
        Use <h1>, <h2>, <p>, <ul>, <ol>, <strong>, <div> quando apropriado, <a> quando apropriado, style da tag quando apropriado, ate mesmo <div> e estilização usando css exemplo: <div style="estilize aqui com css"></div> quando apropriado.           
        Coloque tb, de maneira correta e adequada, a <img src="http://localhost:5000/static/logotipo.jpg" style="width:400px; height:auto;"/>
 que terá o  logotipo da Agência                        
Aqui está uma sugestão de
como isso pode ser feito:                                              
            <informacoes>
              {informacoes}
            </informacoes>

                                              

   
        """, input_variables=["informacoes"])

        output_parser = StrOutputParser()

        chain = prompt | self.__chat | output_parser
        resposta = chain.invoke({
            "informacoes": texto
        })
        return resposta