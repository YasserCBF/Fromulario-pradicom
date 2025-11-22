// src/app/api/dni/route.ts
import { NextRequest } from 'next/server'

const PERUDEVS_KEY = 'cGVydWRldnMucHJvZHVjdGlvbi5maXRjb2RlcnMuNjkyMGZkNDZiMzRiYmQ0MjA5ZmZlN2I2' // ← Pega aquí tu key real

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dni = searchParams.get('dni')

  if (!dni || dni.length !== 8 || !/^\d+$/.test(dni)) {
    return Response.json({ estado: false, mensaje: 'DNI inválido' })
  }

  try {
    const res = await fetch(
      `https://api.perudevs.com/api/v1/dni/simple?document=${dni}&key=${PERUDEVS_KEY}`
    )
    const data = await res.json()

    if (data.estado === true) {
      return Response.json({
        success: true,
        nombre: data.resultado.nombre_completo,
        nombres: data.resultado.nombres,
        apellido_paterno: data.resultado.apellido_paterno,
        apellido_materno: data.resultado.apellido_materno,
      })
    } else {
      return Response.json({ success: false, mensaje: 'DNI no encontrado' })
    }
  } catch (error) {
    return Response.json({ success: false, mensaje: 'Error de conexión' })
  }
}