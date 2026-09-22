import { Prisma } from "@/generated/prisma";
import { createUser, getUserByEmail } from "@/lib/data/users";
import { createMobileSession } from "@/lib/mobile/auth";
import { MOBILE_CONFIG } from "@/lib/mobile/config";
import { toMeDto } from "@/lib/mobile/dto";
import { ApiError, handle, json, readJsonBody } from "@/lib/mobile/http";
import { registerBodySchema } from "@/lib/mobile/schemas";

const EMAIL_TAKEN = "Un compte existe déjà avec cette adresse e-mail.";

export async function POST(request: Request) {
  return handle(async () => {
    const body = registerBodySchema.parse(await readJsonBody(request));

    if (await getUserByEmail(body.email)) {
      throw new ApiError(409, "EMAIL_TAKEN", EMAIL_TAKEN);
    }
    let user;
    try {
      user = await createUser({
        name: body.name,
        email: body.email,
        password: body.password,
        credits: MOBILE_CONFIG.signupBonusCredits,
      });
    } catch (error) {
      // Two sign-ups with the same address at the same instant: the database wins.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ApiError(409, "EMAIL_TAKEN", EMAIL_TAKEN);
      }
      throw error;
    }

    const session = await createMobileSession(user.id, body.deviceName);
    return json({ ...session, user: toMeDto(user) }, 201);
  });
}
