'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Navbar from '@/components/Navbar'
import { Loader2 } from 'lucide-react'
import { useConsultaDni } from '@/hooks/useConsultaDni'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  return (
    <>
      {/* BOTÓN ADMIN SIEMPRE VISIBLE */}
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 flex items-center justify-center p-6">
        {!mostrarFormulario ? (
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-10 drop-shadow-2xl">
              PRADICOM 2025
            </h1>
            <Button
              onClick={() => setMostrarFormulario(true)}
              size="lg"
              className="text-4xl h-24 px-16 bg-white text-indigo-700 hover:bg-gray-100 font-bold shadow-2xl"
            >
              INSCRIBIR ALUMNO(S)
            </Button>
          </div>
        ) : (
          <FormularioUniversal />
        )}
      </div>
    </>
  )
}

function FormularioUniversal() {
  // Responsable
  const [dniResp, setDniResp] = useState('')
  const [nombreResp, setNombreResp] = useState('')
  const [celular, setCelular] = useState('')
  const { consultar, loading } = useConsultaDni()

  // Alumnos (dinámico: de 1 a 35)
  const [alumnos, setAlumnos] = useState([
    { nombre: '', dni: '', edad: '', grado: '', colegio: '', tipo_colegio: '', genero: '' }
  ])

  const buscarDniResponsable = async () => {
    if (dniResp.length !== 8) return
    const res = await consultar(dniResp)
    if (res) setNombreResp(res.nombre)
    else alert('DNI del responsable no encontrado')
  }

  const agregarAlumno = () => {
    if (alumnos.length < 35) {
      setAlumnos([...alumnos, { nombre: '', dni: '', edad: '', grado: '', colegio: '', tipo_colegio: '', genero: '' }])
    }
  }

  const actualizarAlumno = (i: number, campo: string, valor: string) => {
    const nuevos = [...alumnos]
    nuevos[i] = { ...nuevos[i], [campo]: valor }
    setAlumnos(nuevos)
  }

  const enviar = async () => {
    if (!nombreResp || !celular) return alert('Completa los datos del responsable')
    if (alumnos.filter(a => a.nombre && a.dni).length === 0) return alert('Ingresa al menos 1 alumno')

    await supabase.from('inscripciones').insert({
      tipo: alumnos.length > 4 ? 'Masivo' : 'Parental',
      codigo_boleta: alumnos.length > 4 ? `B2025-${Date.now()}` : null,
      responsable: { nombre: nombreResp, celular },
      alumnos: alumnos.filter(a => a.nombre && a.dni)
    })

    alert(`¡Inscripción de ${alumnos.filter(a => a.nombre).length} alumno(s) enviada con éxito!`)
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-8 overflow-y-auto max-h-screen">
      <h2 className="text-4xl font-black text-center text-indigo-700">Inscripción Única 2025</h2>

      {/* RESPONSABLE */}
      <div className="p-6 bg-indigo-50 rounded-2xl border-4 border-indigo-300">
        <h3 className="text-2xl font-bold mb-4">Responsable (Padre/Madre/Docente)</h3>
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <Input placeholder="DNI" value={dniResp} onChange={e => setDniResp(e.target.value.replace(/\D/g, '').slice(0,8))} maxLength={8} />
          <Button onClick={buscarDniResponsable} disabled={loading || dniResp.length !== 8}>
            {loading ? <Loader2 className="animate-spin" /> : 'Buscar DNI'}
          </Button>
          <Input value={nombreResp} readOnly placeholder="Nombre se llena solo" className="font-bold" />
        </div>
        <Input className="mt-4" placeholder="Celular" value={celular} onChange={e => setCelular(e.target.value)} />
      </div>

      {/* ALUMNOS */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">Alumnos ({alumnos.length})</h3>
          {alumnos.length < 35 && (
            <Button onClick={agregarAlumno} className="bg-green-600">+ Agregar alumno</Button>
          )}
        </div>

        {alumnos.map((alumno, i) => (
          <div key={i} className="p-6 border-2 rounded-xl bg-gray-50">
            <h4 className="font-bold text-lg mb-3">Alumno {i + 1}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Input placeholder="Nombre completo" value={alumno.nombre} onChange={e => actualizarAlumno(i, 'nombre', e.target.value)} />
              <Input placeholder="DNI" value={alumno.dni} onChange={e => actualizarAlumno(i, 'dni', e.target.value.replace(/\D/g, '').slice(0,8))} />
              <Input placeholder="Edad" value={alumno.edad} onChange={e => actualizarAlumno(i, 'edad', e.target.value)} />
              <Input placeholder="Grado" value={alumno.grado} onChange={e => actualizarAlumno(i, 'grado', e.target.value)} />
              <Input placeholder="Colegio actual" value={alumno.colegio} onChange={e => actualizarAlumno(i, 'colegio', e.target.value)} />
              <select className="border rounded-lg p-3" value={alumno.tipo_colegio} onChange={e => actualizarAlumno(i, 'tipo_colegio', e.target.value)}>
                <option value="">Tipo colegio</option>
                <option>Público</option>
                <option>Privado</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={enviar} size="lg" className="w-full text-3xl h-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        ENVIAR INSCRIPCIÓN
      </Button>
    </div>
  )
}