# Animación "polea sobre mesa" — la parte de Física

Para el profesor que carga las clases. También sirve para quien programa y no
sabe Física: el glosario del final explica cada término en criollo.

La animación hace cuentas de Física y se las muestra a los alumnos. Quien la
programó **no puede saber si la Física está bien**: eso lo tiene que confirmar
alguien que la enseña. Este documento dice qué supone el modelo, qué cuentas
hace y qué casos conviene comprobar a mano.

---

## 1. Qué ve el alumno

Una caja de masa m₁ sobre una mesa, unida por una cuerda que pasa por una polea
a una bola de masa m₂ que cuelga. Arranca quieta. Al apretar **Reproducir**, la
bola cae y arrastra la caja. Se mueven con la aceleración que corresponde a los
datos del ejercicio. Si el rozamiento alcanza para frenarla, no se mueve nada y
aparece "El sistema queda en reposo".

Si se prende "Mostrar valores", al lado del botón aparecen la aceleración y la
tensión: `a = 2,8 m/s² · T = 140 N`.

---

## 2. Qué supone el modelo

Estas son las simplificaciones de siempre de los ejercicios de ingreso. Si
algún ejercicio no las cumple, la animación **no sirve para ese ejercicio**.

| Supuesto | Qué significa |
|---|---|
| Cuerda ideal | No se estira y no tiene masa: la caja y la bola se mueven igual de rápido y la tensión es la misma en toda la cuerda |
| Polea ideal | Sin masa y sin rozamiento en el eje: solo cambia la dirección de la cuerda |
| Rozamiento seco entre caja y mesa | Coeficiente estático μe para decidir si arranca, cinético μc mientras se mueve |
| Sin rozamiento del aire | |
| Parte del reposo | No hay velocidad inicial |
| Nada choca | La caja frena antes de la polea y la bola no toca el piso |

**Queda afuera:** polea con masa, cuerda con masa, plano inclinado, dos cuerpos
colgando (máquina de Atwood), una fuerza extra aplicada a la caja, velocidad
inicial y rozamiento entre la bola y algo.

---

## 3. Las cuentas que hace

Diagrama de cuerpo libre de cada cuerpo, tomando como positivo el sentido del
movimiento (caja hacia la polea, bola hacia abajo):

- **Caja:** T − fr = m₁·a, con N = m₁·g
- **Bola:** m₂·g − T = m₂·a

**¿Arranca?** Arranca si el peso de la bola supera el rozamiento estático
máximo:

> m₂·g > μe·m₁·g, o sea **m₂ > μe·m₁** (la g se cancela)

**Si arranca**, sumando las dos ecuaciones:

> **a = g·(m₂ − μc·m₁) / (m₁ + m₂)**
> **T = m₂·(g − a)**

**Si no arranca:** a = 0, el rozamiento estático vale justo lo necesario
(fr = m₂·g) y la tensión es **T = m₂·g**.

### Convenciones que eligió el programa (confirmalas)

1. **Si el ejercicio da un solo coeficiente, vale para los dos.** Si se carga
   solo μc, se usa también para decidir si arranca, y lo mismo al revés. Es lo
   que hacen la mayoría de los enunciados de ingreso ("coeficiente de
   rozamiento 0,2").
2. **En el límite exacto queda en reposo.** Con m₂ = μe·m₁ (por ejemplo 20 kg
   y μ = 0,4 con 50 kg), el peso de la bola *iguala* al rozamiento máximo y no
   lo supera, así que no arranca.
3. **g = 9,8 m/s² por defecto.** Se puede cambiar en cada animación. Si
   resolvés con g = 10, cargá 10: si no, los valores que ve el alumno no
   coinciden con tu resolución.
4. **Los resultados (a y T) se redondean a 2 decimales**, con coma: 2,857… se
   muestra como 2,86. Los **datos** (masas y μ) se muestran exactamente como
   los cargaste: 0,125 kg se ve como 0,125.
5. **No es tiempo real.** Se ve en cámara lenta ×2, y el recorrido de la
   pantalla representa 1,5 m. Sirve para *ver* que con más rozamiento se mueve
   más lento, pero **no** para pedirle al alumno que mida tiempos.

---

## 4. Casos para comprobar a mano

Resolvé cada uno como lo harías en clase y compará con lo que dice la
animación. Estos números los calculó el mismo código que usa la página.

| # | Datos | ¿Se mueve? | a (m/s²) | T (N) |
|---|---|---|---|---|
| 1 | m₁ = 50, m₂ = 20, sin rozamiento | Sí | 2,8 | 140 |
| 2 | Igual que 1, con g = 10 | Sí | 2,86 | 142,86 |
| 3 | m₁ = 50, m₂ = 20, un solo μ = 0,2 | Sí | 1,4 | 168 |
| 4 | m₁ = 50, m₂ = 20, μe = 0,3 y μc = 0,2 | Sí | 1,4 | 168 |
| 5 | m₁ = 50, m₂ = 20, μe = 0,5 y μc = 0,2 | **No** | 0 | 196 |
| 6 | m₁ = 50, m₂ = 20, μ = 0,4 (límite) | **No** | 0 | 196 |
| 7 | m₁ = 10, m₂ = 30, sin rozamiento | Sí | 7,35 | 73,5 |
| 8 | m₁ = 3, m₂ = 2,1, μ = 0,7 (límite) | **No** | 0 | 20,58 |

- [ ] Los 8 casos coinciden con tu resolución.
- [ ] El caso 5 es el más interesante para clase: con el cinético solo
      (μc·m₁ = 10 < 20) se movería, pero nunca arranca porque el estático lo
      frena antes (μe·m₁ = 25 > 20).
- [ ] El caso 8 existe porque la compu, en el límite exacto, calculaba
      0,7 × 3 = 2,0999999999999996 y decía que arrancaba. Ya está corregido;
      si alguna vez ves una animación que "arranca" en un caso límite, avisá.

---

## 5. Cómo cargarla

1. En el panel, dentro de una sección de teoría, un ejercicio, una pregunta de
   evaluación o una explicación: **Agregar animación**.
2. Completá m₁ y m₂ en kg. Los μ son opcionales. Coma o punto, da igual.
3. Revisá la vista previa que aparece debajo y apretá Reproducir para probar.
4. Guardá la clase como siempre.

**Dónde va cada cosa:**

| Situación | Dónde ponerla | "Mostrar valores" |
|---|---|---|
| Ilustrar el enunciado | Enunciado | **Apagado**, si no le das la respuesta |
| Mostrar la resolución | Explicación | Prendido, para que compare con lo que calculó |
| La pregunta es "¿se mueve el sistema?" | **Solo en la explicación** | Cualquiera: apretar Reproducir ya responde |

---

## 6. Lo que necesitamos que decidas

- [ ] ¿Las cuentas de la sección 3 están bien, con estos supuestos?
- [ ] ¿Estás de acuerdo con las cinco convenciones? En especial con la 1 (un
      solo μ vale para los dos) y la 2 (en el límite queda quieto).
- [ ] En tus ejercicios, ¿usás más g = 9,8 o g = 10? Si es 10, conviene que
      ese sea el valor por defecto.
- [ ] ¿Querés que la animación dibuje las fuerzas (flechas de peso, normal,
      tensión y rozamiento)? Hoy no las dibuja.
- [ ] ¿Qué otras escenas te servirían más? Por ejemplo: plano inclinado,
      máquina de Atwood, dos cajas sobre la mesa. Ordenalas por cuánto las
      usás.

---

## Glosario en criollo

| Término | Qué es |
|---|---|
| **Masa (m)** | Cuánta "materia" tiene un cuerpo, en kg. Cuanta más masa, más cuesta moverlo |
| **Peso** | La fuerza con que la Tierra tira de un cuerpo hacia abajo: masa × g |
| **g** | La aceleración de la gravedad: ≈ 9,8 m/s². Muchos profes redondean a 10 |
| **Aceleración (a)** | Cuánto aumenta la velocidad por segundo, en m/s². a = 2,8 quiere decir que cada segundo va 2,8 m/s más rápido |
| **Tensión (T)** | La fuerza que hace la cuerda tirando de cada punta, en newtons (N) |
| **Normal (N)** | La fuerza con que la mesa empuja a la caja hacia arriba para que no la atraviese. Acá vale lo mismo que el peso de la caja |
| **Rozamiento** | La fuerza de la mesa que se opone a que la caja se deslice |
| **μ (mu)** | El coeficiente de rozamiento: un número sin unidades que dice qué tan "pegajosas" son las superficies. 0 es hielo perfecto |
| **μe (estático)** | El que hay que vencer para que la caja *empiece* a moverse |
| **μc (cinético)** | El que frena a la caja *mientras* se mueve. Siempre es menor o igual que el estático, porque cuesta más arrancar que seguir |
| **Diagrama de cuerpo libre** | El dibujo de un cuerpo solo, con todas las flechas de las fuerzas que actúan sobre él. Es el primer paso para resolver cualquier ejercicio de este tipo |
| **Segunda ley de Newton** | Fuerza neta = masa × aceleración. Es la ecuación que se usa en cada cuerpo de la sección 3 |
