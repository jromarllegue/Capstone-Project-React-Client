import React, { useEffect, useState } from 'react';
import BoardStudent from './dashboard/BoardStudent';
import BoardProfessor from './dashboard/BoardProfessor';
import { getToken } from './validator';
import NotFound from './NotFound';

function Dashboard() {
    const [auth, setAuth] = useState({});

    useEffect(() => {
        const init = async () => setAuth(await getToken());
        init();
        document.title = 'Dashboard · PnCode: Real-Time Collaborative Coding Website for College of Computing Studies Department of University of Cabuyao PNC(UC)';
    },[]);
   
    return (
        <>
            {auth && auth?.position === 'Student' &&
                <BoardStudent auth={auth}/> 
            }
            {auth && auth?.position === 'Professor' &&
                <BoardProfessor auth={auth}/>
            }
            {auth === false && <NotFound />}
        </>
    );
}
  
export default Dashboard;