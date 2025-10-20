import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from '@prisma/client'
// import bcrypt from 'bcryptjs'

// const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Временно отключено для тестирования деплоя
    return NextResponse.json(
      { error: 'Регистрация временно недоступна' },
      { status: 503 }
    )

    // const { name, email, password } = await request.json()

    // // Проверяем, существует ли пользователь
    // const existingUser = await prisma.user.findUnique({
    //   where: {
    //     email: email
    //   }
    // })

    // if (existingUser) {
    //   return NextResponse.json(
    //     { error: 'Пользователь с таким email уже существует' },
    //     { status: 400 }
    //   )
    // }

    // // Хешируем пароль
    // const hashedPassword = await bcrypt.hash(password, 12)

    // // Создаем нового пользователя
    // const user = await prisma.user.create({
    //   data: {
    //     name,
    //     email,
    //     password: hashedPassword,
    //   }
    // })

    // // Возвращаем данные пользователя без пароля
    // const { password: _, ...userWithoutPassword } = user

    // return NextResponse.json(
    //   { 
    //     message: 'Пользователь создан успешно',
    //     user: userWithoutPassword 
    //   },
    //   { status: 201 }
    // )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

