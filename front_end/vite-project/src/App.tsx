import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./componentes/Login/Login";
import PrivateRoute from "./componentes/PrivateRoute/PrivateRoute";
import Portal
from "./componentes/Portal/portal";
import { Navigate } from 'react-router-dom';
import GerenciarUser from './componentes/GerenciarUser/GerenciarUser';

 //<PrivateRoute> <Portal/> </PrivateRoute> permite passar o <Portal/> como parâmetro para PrivateRoute
function app(){

  return (<>
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/administrador" element={<PrivateRoute> <GerenciarUser/> </PrivateRoute> }/>
        <Route path="/portal" element={<PrivateRoute> <Portal/> </PrivateRoute>}/>
        <Route path="*" element={<Navigate to="/login" replace />} />
 
      </Routes>
    </Router>

    </>)

}


export default app;