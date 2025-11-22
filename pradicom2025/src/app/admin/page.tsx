'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search, Edit, Trash2, X } from 'lucide-react'

export default function AdminPanel() {
  const [datos, setDatos] = useState<any[]>([])
  const [filtrados, setFiltrados] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState<string | null>(null)
  const [formEdit, setFormEdit] = useState<any>(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const { data } = await supabase
      .from('inscripciones')
      .select('*')
      .order('created_at', { ascending: false })
    setDatos(data || [])
    setFiltrados(data || [])
    setCargando(false)
  }

  // BUSCADOR EN TIEMPO REAL
  useEffect(() => {
    if (busqueda === '') {
      setFiltrados(datos)
      return
    }
    const term = busqueda.toLowerCase()
    const resultado = datos.filter(ins =>
      ins.responsable?.nombre?.toLowerCase().includes(term) ||
      ins.responsable?.celular?.includes(term) ||
      ins.alumnos?.some((a: any) => 
        a.nombre?.toLowerCase().includes(term) || 
        a.dni?.includes(term)
      )
    )
    setFiltrados(resultado)
  }, [busqueda, datos])

  const iniciarEdicion = (ins: any) => {
    setEditando(ins.id)
    setFormEdit({
      responsable: { ...ins.responsable },
      alumnos: [...ins.alumnos]
    })
  }

  const guardarEdicion = async () => {
    if (!editando || !formEdit) return
    const { error } = await supabase
      .from('inscripciones')
      .update({ responsable: formEdit.responsable, alumnos: formEdit.alumnos })
      .eq('id', editando)
    if (!error) {
      alert('¡Editado correctamente!')
      setEditando(null)
      cargarDatos()
    }
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta inscripción?')) return
    const { error } = await supabase.from('inscripciones').delete().eq('id', id)
    if (!error) {
      cargarDatos()
    }
  }

  const exportarExcel = async () => {
    const XLSX = await import('xlsx')
    const filas: any[] = []
    filtrados.forEach(ins => {
      ins.alumnos.forEach((a: any) => {
        filas.push({
          Titular: ins.responsable.nombre || '',
          'DNI Titular': ins.responsable.dni || '-',
          Celular: ins.responsable.celular || '-',
          Alumno: a.nombre || '',
          'DNI Alumno': a.dni || '',
          Edad: a.edad || '',
          Grado: a.grado || '',
          Colegio: a.colegio || '',
          'Tipo Colegio': a.tipo_colegio || '',
          Género: a.genero || '',
          Fecha: new Date(ins.created_at).toLocaleString('es-PE')
        })
      })
    })
    const ws = XLSX.utils.json_to_sheet(filas)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Inscripciones")
    XLSX.writeFile(wb, `PRADICOM2025_${new Date().toLocaleDateString('es-PE').replace(/\//g,'-')}.xlsx`)
  }

  const total = filtrados.reduce((s, ins) => s + (ins.alumnos?.length || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-black text-center mb-8 text-indigo-700">Panel Admin Pradicom 2025</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-3 h-6 w-6 text-gray-500" />
            <Input 
              placeholder="Buscar por nombre, celular o DNI..." 
              value={busqueda} 
              onChange={e => setBusqueda(e.target.value)} 
              className="pl-12 text-lg" 
            />
          </div>
          <Button onClick={exportarExcel} size="lg" className="bg-green-600 hover:bg-green-700 text-xl px-8">
            Exportar Excel ({total})
          </Button>
        </div>

        <p className="text-right text-2xl font-bold text-indigo-700 mb-6">Total: {total} alumnos</p>

        {cargando ? (
          <p className="text-center text-3xl">Cargando...</p>
        ) : filtrados.length === 0 ? (
          <p className="text-center text-2xl text-gray-600">No hay inscripciones aún</p>
        ) : (
          filtrados.map(ins => (
            <Card key={ins.id} className="mb-8 p-8 shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-2xl font-bold">{ins.responsable?.nombre || 'Sin nombre'}</p>
                  <p className="text-lg">{ins.responsable?.celular || 'Sin celular'}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(ins.created_at).toLocaleString('es-PE')} • {ins.alumnos?.length || 0} alumno(s)
                  </p>
                </div>

                  {/* BOTONES EDITAR Y ELIMINAR (SIEMPRE VISIBLES) */}
                  <div className="flex gap-3">
                    <Button onClick={() => iniciarEdicion(ins)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button onClick={() => eliminar(ins.id)} size="sm" variant="destructive">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ins.alumnos?.map((a: any, i: number) => (
                  <div key={i} className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                    <p className="font-bold text-xl">{a.nombre}</p>
                    <p>DNI: <strong>{a.dni}</strong></p>
                    <p>{a.edad} años • {a.grado} • {a.genero}</p>
                    <p className="text-sm italic">{a.colegio} ({a.tipo_colegio})</p>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}

        {/* MODAL DE EDICIÓN */}
        {editando && formEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Editar Inscripción</h2>
                <Button onClick={() => setEditando(null)} variant="ghost"><X className="h-8 w-8" /></Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-3">Responsable</h3>
                  <Input value={formEdit.responsable.nombre || ''} onChange={e => setFormEdit({...formEdit, responsable: {...formEdit.responsable, nombre: e.target.value}})} placeholder="Nombre" />
                  <Input className="mt-3" value={formEdit.responsable.celular || ''} onChange={e => setFormEdit({...formEdit, responsable: {...formEdit.responsable, celular: e.target.value}})} placeholder="Celular" />
                </div>

                <div>
                  <h3 className="font-bold text-xl mb-3">Alumnos</h3>
                  {formEdit.alumnos.map((a: any, i: number) => (
                    <div key={i} className="border p-4 rounded-lg mb-4 bg-gray-50">
                      <Input className="mb-2" value={a.nombre || ''} onChange={e => {
                        const nuevos = [...formEdit.alumnos]
                        nuevos[i].nombre = e.target.value
                        setFormEdit({...formEdit, alumnos: nuevos})
                      }} placeholder="Nombre completo" />
                      <div className="grid grid-cols-2 gap-3">
                        <Input value={a.dni || ''} onChange={e => { const nuevos = [...formEdit.alumnos]; nuevos[i].dni = e.target.value; setFormEdit({...formEdit, alumnos: nuevos}) }} placeholder="DNI" />
                        <Input value={a.edad || ''} onChange={e => { const nuevos = [...formEdit.alumnos]; nuevos[i].edad = e.target.value; setFormEdit({...formEdit, alumnos: nuevos}) }} placeholder="Edad" />
                        <Input value={a.grado || ''} onChange={e => { const nuevos = [...formEdit.alumnos]; nuevos[i].grado = e.target.value; setFormEdit({...formEdit, alumnos: nuevos}) }} placeholder="Grado" />
                        <Input value={a.colegio || ''} onChange={e => { const nuevos = [...formEdit.alumnos]; nuevos[i].colegio = e.target.value; setFormEdit({...formEdit, alumnos: nuevos}) }} placeholder="Colegio" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-4">
                  <Button onClick={() => setEditando(null)} variant="outline">Cancelar</Button>
                  <Button onClick={guardarEdicion} className="bg-green-600 hover:bg-green-700">Guardar Cambios</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}