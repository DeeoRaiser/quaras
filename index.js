import {bcrypt} from "bcrypt";

const generarHash = async () => {
  const passwordEnPlano = "123456"; // CAMBIAR
  const hash = await bcrypt.hash(passwordEnPlano, 10);
  console.log("HASH:", hash);
}

generarHash()