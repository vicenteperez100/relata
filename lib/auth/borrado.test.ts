import { describe, expect, it } from "vitest";
import { confirmacionBorradoValida } from "./borrado";

describe("confirmacionBorradoValida", () => {
  it.each(["BORRAR", "borrar", "  Borrar  "])("acepta %j", (t) => expect(confirmacionBorradoValida(t)).toBe(true));
  it.each([null, undefined, "", "BORRA", "BORRAR!", "sí", "BORRAR CUENTA"])("rechaza %j", (t) =>
    expect(confirmacionBorradoValida(t)).toBe(false),
  );
});
