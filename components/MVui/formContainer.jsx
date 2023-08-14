"use client"

import React from 'react'

function FormContainer({children}) {
  return (
    <div className="w-full md:w-2/3 xl:w-2/5 flex flex-col gap-3 mx-auto">{children}</div>
  )
}

export default FormContainer