import typing
import psycopg2




class Banco:
    def __init__(self):
       self.__conn = psycopg2.connect(host="postgres", user="gabriel", password="123456789", database="usuarios")
       self.__banco = self.__conn.cursor()
    
    def verificar_dados_user(self, user: dict):
         self.__banco.execute("select * from cadastros where nome=%s and senha=%s;", (user.username, user.password))
         usuario = self.__banco.fetchall()
         if not usuario:
            return None
         
         return usuario
    

    def usuarios_cadastro(self):
        self.__banco.execute("select * from cadastros order by id;")
        usuarios_cadastros = self.__banco.fetchall()
        return usuarios_cadastros
    

    def alterar_cadastro(self, id, nome, senha, permissao):
        self.__banco.execute("update cadastros set nome=%s, senha=%s, permissao=%s where id=%s", (nome,senha,permissao, id))
        self.__conn.commit()


    def adicionar_cadastro(self, nome, senha, permissao):
        self.__banco.execute("insert into cadastros(nome, senha, permissao) values(%s, %s, %s)", (nome, senha, permissao))
        self.__conn.commit()


    def remover_cadastro(self, id):
        self.__banco.execute("delete from cadastros where id=%s", (id,))
        self.__conn.commit()


        
        