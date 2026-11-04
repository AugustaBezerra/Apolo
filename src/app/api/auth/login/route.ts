import { NextResponse } from "next/server";
import { findUserByIdentifier } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Informe seu usuário/e-mail e sua senha." },
        { status: 400 }
      );
    }

    const user = findUserByIdentifier(identifier);

    if (!user) {
      return NextResponse.json(
        { error: "Acesso restrito. Usuário não encontrado." },
        { status: 401 }
      );
    }

    const senhaValida = bcrypt.compareSync(password, user.password_hash);
    if (!senhaValida) {
      return NextResponse.json(
        { error: "Senha incorreta. Verifique suas credenciais." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao autenticar." },
      { status: 500 }
    );
  }
}
