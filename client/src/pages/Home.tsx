import { useEffect, useState } from "react";

import { Alert, Spinner } from "flowbite-react";
import api from "../api/axios";
import AppNavbar from "../components/AppNavbar";

export default function Home() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(()=>{
    api.get('/auth/me')
    .then((res)=>setFirstName(res.data.firstName))
    .catch(()=>setError('impossible to load informations'))
  })
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Alert color="failure">{error}</Alert>
      </div>
    );
  }
    if (!firstName) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="xl" />
      </div>
    );
  }
return(
    <>
       <AppNavbar/>
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 dark:bg-gray-900 px-4">

    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white text-center">
        Welcome, {firstName} 🙋🏻‍♀️
      </h1>

    </div>
    </>
)
}
