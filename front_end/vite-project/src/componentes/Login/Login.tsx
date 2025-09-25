import React, { useEffect, useState } from 'react'
import './Login.css'
import { useNavigate } from 'react-router-dom' ///////////////////////

function Login() {
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  const navigate = useNavigate();



  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
         e.preventDefault()
         try{
            const response = await fetch("http://localhost:5000/login", 
              {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({username: nome, password: senha})
              }
            )
   

            if (response.status == 200) {
                const data = await response.json();
                console.log(data)

                localStorage.setItem("token", data[0].token) //////////////
                localStorage.setItem("permissao", data[0].permissao)
                navigate("/portal")      ///////////// navega para o <route> cujo path é /portal
            }else{
              setErro("ERRO: O nome de usuário ou senha estão incorretos")
            }
                        



        }catch(erro){
           console.log(`Ocorreu o Seguinte erro no front-end funcao submit: ${erro}`);

         }
  }

  useEffect(()=>{
   const token = localStorage.getItem("token");
   if (token){
     navigate("/portal")
   }
  }, [])


  return (

      <div className="form-container">

        <h1>Login</h1>
        <form onSubmit={submit}>
          <div className='form-row'>
            <label>Nome</label>
            <input type='text' placeholder='Digite o seu nome...' name='nome' onChange={e => setNome(e.target.value)}/>
          </div>

          <div className='form-row'>
            <label>Senha</label>
            <input type='password' placeholder='senha' name='senha' onChange={e => setSenha(e.target.value)}/>
             
          </div>

          <div className='form-row'>
             <button className="submit_login" type='submit'>Log In</button>
          </div>
                       {erro && <div className='erro'>{erro}</div>}


        </form>
      </div>

  )
}

export default Login
