import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import './GerenciarUser.css'


interface Cadastro{
  id: number;
  nome: string;
  senha: string;
  permissao: string;
}
function GerenciarUser(){
    const [data, setData] = useState<Cadastro[]>([]);

   const navigate = useNavigate()
   const token = localStorage.getItem("token");
   const acessar_administrador = async () => {
      try {
         const response = await fetch("http://localhost:5000/administrador", {
         headers: { Authorization: `Bearer ${token}` },
         });
         console.log(`Teste testando ${response.status}\n ${JSON.stringify(await response.json(), null, 2)}`);

         
        if (response.status==401){
            navigate("/portal");

        }
      } catch (erro) {
         console.log(`Erro no front-end acessar_portal: ${erro}`);
         navigate("/portal");
      }
   }



   useEffect(()=>{
      acessar_administrador();
      pegar_dados_cadastro();
   }, [])



  //pega os cadastros no banco de dados
  const pegar_dados_cadastro = async (event) => {
    try{
      const response = await fetch("http://localhost:5000/pegar_dados_do_db", {
        method: "GET",
        headers: {"Content-Type":"application/json", "Authorization": `Bearer ${token}`},
      })
      const cadastros = await response.json()
      for (let i = 0; i < cadastros.length; i++) {
               setData(cadastros);

          console.log(cadastros[i]);
      }
      
     
      }catch(erro){
      console.log(erro)
    }

  
  }

  // Função para remover uma linha
  const remover = async (id) => {
    try{
      const response = fetch("http://localhost:5000/remover_dados_no_db", {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization":`Bearer ${token}`},
        body: JSON.stringify({id})
      })
    }catch(erro){
        console.log(erro)
    }
    
    setData(data.filter((item) => item.id !== id));
  };

  //verificação de erro "vazio" nos unputs em adicionar
  const [vazioNome, setVazioNome] = useState(false);
  const [vazioSenha, setVazioSenha] = useState(false);
  

    // Estado do formulário
  const [novoNome, setNovoNome] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [novaPermissao, setNovaPermissao] = useState("user");

  
  // Estado de pesquisa
  const [busca, setBusca] = useState("");


   // Função para adicionar linha
  const adicionar = async (e) => {
    e.preventDefault(); // evitar refresh da página

    //verificar se os campos estão vazios
    if (novoNome.trim()==""){
        setVazioNome(true)
    }

    if (novaSenha.trim()==""){
      setVazioSenha(true)
    }



    if (novoNome.trim()!="" ||  novaSenha.trim()!=""){
        console.log(novaPermissao)
        const novoItem = {
          id: data.length ? data[data.length - 1].id + 1 : 1, // gera novo id
          nome: novoNome,
          senha: novaSenha,
          permissao: novaPermissao
        };

        try{
            const response = await fetch("http://localhost:5000/adicionar_dados_no_db", {
              method: "POST",
              headers: {"Content-Type":"application/json", "Authorization":`Bearer ${token}`},
              body: JSON.stringify({novoNome, novaSenha, novaPermissao})
            })
          }catch(erro){
            console.log(erro)
          }

        if (!novoNome.trim() || !novaSenha) return;

        setData([...data, novoItem]);

        // limpa os campos
        setNovoNome("");
        setNovaSenha("");
        setNovaPermissao("user");


        //resetar vazio
        setVazioNome(false)
        setVazioSenha(false)
    }
  };

    // Estado de edição
  const [editandoId, setEditandoId] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editSenha, setEditSenha] = useState("");
  const [editPermissao, setEditPermissao] = useState("");

  // Função para entrar em modo edição
  const editar = (pessoa) => {
    setEditandoId(pessoa.id);
    setEditNome(pessoa.nome);
    setEditSenha(pessoa.senha);
    setEditPermissao(pessoa.permissao);
  };


  //salvar alteração no banco de dados

  // Função para salvar edição
  const salvar = async (id) => {
    try{ 
      const response = await fetch("http://localhost:5000/alterar_dados_do_db", {
        method: "POST",
        headers: {"Content-Type":"application/json", "Authorization":`Bearer ${token}`},
        body: JSON.stringify({id: id, nome: editNome, senha: editSenha, permissao: editPermissao})
      })
      const data = await response.json()
      console.log(data)

      
    }catch(erro){
      console.log(erro)
    }






    setData(
      data.map((item) =>
        item.id === id ? { ...item, nome: editNome, senha: editSenha, permissao: editPermissao } : item
      )
    );
    setEditandoId(null);
  };

  // Função para cancelar edição
  const cancelar = () => {
    setEditandoId(null);
    setEditNome("");
    setEditSenha("");
    setEditPermissao("");
  };
  // Filtrar os dados pela busca
  const dadosFiltrados = data.filter((pessoa) =>
    pessoa.nome.toLowerCase().includes(busca.toLowerCase())
  );


  return (
    <div id="GerenciarUserDiv">
      <button className="btn_voltar_GerenciarUserDiv" onClick={() => navigate('/portal')}>Voltar</button>
      <h2>Cadastros</h2>

            {/* Barra de busca */}
      <input
        name="busca"
        id="busca"
        type="text"
        placeholder="Buscar por nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={{ marginBottom: "10px", display: "block" }}
      />

      

      {/* Formulário de adição */}
      <form id="GerenciarUserDivForm" onSubmit={adicionar}>
        <div className="inputNomeGerenciarUserDivForm">
              <input 
                type="text"
                placeholder="Nome"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                style={{border: vazioNome ? "1px solid red" : "1px solid black"}}
              />
              {vazioNome && (<div className="nomeVazio">Campo nome não pode estar vazio!!</div>)}
        </div>

        <div className="inputSenhaGerenciarUserDivForm">
            <input 
              type="text"
              placeholder="Senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              style={{border: vazioSenha ? "1px solid red":"1px solid black"}}
            />
            {vazioSenha && (<div className="senhaVazio">Campo Senha não pode estar vazio!!</div>)}
        </div>

        <select  value={novaPermissao}
          onChange={(e) => setNovaPermissao(e.target.value)}
        > 
         <option value="user">user</option>
         <option value="root">root</option>
        
        </select>
        <button type="submit">Adicionar</button>
      </form>

      {/* Tabela */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Senha</th>
            <th>Permissão</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {dadosFiltrados.map((pessoa) => (
            <tr key={pessoa.id}>
              <td>{pessoa.id}</td>

              {/* Se estiver editando, mostra inputs */}
              {editandoId === pessoa.id ? (
                <>
                  <td>
                    <input
                      name="nome"
                      id="nome"
                      type="text"
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      name="senha"
                      id="senha"                    
                      type="text"
                      value={editSenha}
                      onChange={(e) => setEditSenha(e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      id="permissao"                    
                      value={editPermissao}
                      onChange={(e) => setEditPermissao(e.target.value)}
                    >
                      <option value="user">user</option>
                      <option value="root">root</option>
                    </select>
                  </td>
                  <td>
                    <button className="salvar" onClick={() => salvar(pessoa.id)}>Salvar</button>
                    <button className="cancelar" onClick={cancelar}>Cancelar</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{pessoa.nome}</td>
                  <td>{pessoa.senha}</td>
                  <td>{pessoa.permissao}</td>

                  <td>
                    <button className="editar" onClick={() => editar(pessoa)}>Editar</button>
                    <button className="remover" onClick={() => remover(pessoa.id)}>Remover</button>
                  </td>
                </>
              )}
            </tr>
          ))}

          {dadosFiltrados.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                Nenhum dado encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


export default GerenciarUser