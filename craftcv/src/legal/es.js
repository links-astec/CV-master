// Spanish translation of the Privacy policy and the Terms (same sections and ids as the English
// in src/views/Legal.vue). If the two differ, the English version applies.
export const UPDATED = '12 de octubre de 2026'

export default ({ mail }) => {
  const TEAM = 'Gabriel Quaye y Nisy Adjei Acheampong'
  return [
    {
      id: 'privacy', tab: 'Política de privacidad', title: 'Política de privacidad',
      summary: [
        'Nunca vendemos tus datos ni te mostramos anuncios.',
        'Tu CV es tuyo. Bórralo, o borra tu cuenta entera, cuando quieras.',
        'Los datos de tu tarjeta van directamente a Stripe; nunca los vemos ni los guardamos.',
        'Una sola cookie para mantener la sesión. Sin cookies de seguimiento ni de publicidad.',
      ],
      sections: [
        { id: 'who', title: 'Quiénes somos', html: `<p>CVMaster («nosotros») es un creador de CV asistido por IA, disponible en cvmaster.live y gestionado en Francia por ${TEAM}, responsables del tratamiento de tus datos personales. Contacto: ${mail}.</p>` },
        { id: 'collect', title: 'Qué datos recogemos', html: `<ul>
          <li><strong>Datos de la cuenta</strong>: tu nombre, tu dirección de correo y tu contraseña (guardada solo como hash seguro).</li>
          <li><strong>Tus CV</strong>: todo lo que escribes en ellos. Sin cuenta, tu CV se queda solo en tu navegador hasta que te registres.</li>
          <li><strong>Ofertas de empleo</strong>: las descripciones que pegas para adaptar un CV, guardadas con ese CV.</li>
          <li><strong>Pagos</strong>: los gestiona Stripe. Guardamos constancia de que un CV se ha pagado, nunca los datos de tu tarjeta.</li>
          <li><strong>Mensajes que nos envías</strong>: comentarios y reclamaciones, con el correo que nos das para responderte.</li>
          <li><strong>Datos técnicos</strong>: registros básicos del servidor (dirección IP, hora) por seguridad y para resolver problemas.</li>
        </ul>` },
        { id: 'use', title: 'Para qué los usamos', html: `<ul>
          <li>Para gestionar tu cuenta y guardar tus CV.</li>
          <li>Para las funciones de IA que decidas usar (ayuda para redactar, adaptación a una oferta, verificación ATS, verificación de encaje con el puesto, traducción).</li>
          <li>Para personalizar las sugerencias de la IA en los CV a tu nombre, con tus respuestas al registrarte y tus otros CV. Los CV que haces para otra persona no los usan, y puedes desactivarlo en Ajustes.</li>
          <li>Para enviarte tu CV por correo y mensajes sobre tu cuenta, como el restablecimiento de la contraseña.</li>
          <li>Para cobrar los pagos a través de Stripe.</li>
          <li>Para responder a tus comentarios y reclamaciones, y para mejorar CVMaster.</li>
        </ul>` },
        { id: 'personal', title: 'Personalización, notificaciones y voz', html: `<p><strong>Tu país</strong>: la web y la app registran el país configurado en tu dispositivo, según su zona horaria (nunca según tu dirección de internet). Lo usamos para mostrar los precios en tu moneda y contar cuántas personas usan CVMaster en cada país, con o sin cuenta.</p><p>Cuando has iniciado sesión, guardamos un registro breve de lo que haces en CVMaster, en la web y en la app: por ejemplo, que has creado un CV, elegido un diseño, usado una función de IA, comparado un CV con una oferta o lo has exportado. Lo usamos solo para personalizar CVMaster para ti: sugerirte el siguiente paso, mostrarte primero los diseños que te gustan y recordarte, como mucho una vez por semana, dónde lo dejaste. Se queda en nuestros propios servidores, nunca se vende ni se comparte y nunca se usa para publicidad. Se borra a los 13 meses, y con tu cuenta.</p><p>Puedes desactivarlo cuando quieras en Ajustes («Personalizar con mi actividad»); lo que habíamos guardado se borra entonces. Nos basamos en nuestro interés legítimo en que CVMaster te resulte útil, y tu derecho de oposición siempre se aplica.</p><p><strong>Notificaciones push</strong> (app móvil): si las permites, te enviamos notificaciones, por ejemplo un CV gratis conseguido con tu enlace de invitación, y los recordatorios anteriores. Para ello guardamos un identificador de notificaciones de tu teléfono; las notificaciones se entregan a través de Expo, Apple y Google. Desactívalas en los Ajustes de la app o de tu teléfono.</p><p><strong>Entrada por voz</strong> (app móvil): si grabas tu historia, la grabación se envía a un servicio de transcripción para convertirla en texto. No guardamos la grabación.</p>` },
        { id: 'newsletter', title: 'Newsletter', html: `<p>Solo te enviamos nuestra newsletter (consejos para tu CV y novedades de CVMaster) si la pides: en la página de inicio, con la casilla opcional al crear tu cuenta, o en Ajustes. Si te suscribes desde la página de inicio, primero te enviamos un enlace para confirmarlo. La base legal es tu consentimiento.</p><p>Guardamos tu dirección de correo, cuándo y dónde diste tu consentimiento y cuándo te diste de baja. Cada newsletter incluye un enlace para darte de baja con un clic; también puedes desactivarla en Ajustes o escribir a ${mail}. Dejamos de enviarla de inmediato. Los correos sobre tu cuenta y tus compras no se ven afectados.</p>` },
        { id: 'share', title: 'Con quién los compartimos', html: `<p>No vendemos tus datos. Solo los compartimos con los servicios que hacen funcionar CVMaster:</p><ul>
          <li><strong>Proveedores de servicios de IA</strong>: El texto del CV y la oferta de empleo que se usen en una función de IA se les envían para obtener el resultado.</li>
          <li><strong>Stripe</strong>: pagos.</li>
          <li><strong>Resend</strong>: envío de correos, incluidos los PDF de los CV que exportas.</li>
          <li><strong>Google</strong>: solo si inicias sesión con Google.</li>
          <li><strong>Vercel, Render y Neon</strong>: alojamiento y la base de datos donde se guardan tus datos.</li>
        </ul><p>Algunos de estos proveedores están en Estados Unidos o tratan datos allí. Cuando los datos salen de la UE, están protegidos por las garantías que exige el RGPD, como las cláusulas contractuales tipo de la Comisión Europea o el Marco de Privacidad de Datos UE–EE. UU.</p>` },
        { id: 'keep', title: 'Cuánto tiempo los guardamos', html: `<p>Guardamos tu cuenta y tus CV hasta que los borres o nos pidas que lo hagamos. Los comentarios y reclamaciones se guardan el tiempo necesario para resolver el asunto. Los registros de pago pueden conservarse más tiempo cuando la ley lo exige.</p>` },
        { id: 'rights', title: 'Tus derechos', html: `<p>Según la normativa de protección de datos del Reino Unido y de la UE, puedes pedir acceder a tus datos personales, rectificarlos, exportarlos o borrarlos, u oponerte a su uso. Escribe a ${mail} y te responderemos en el plazo de un mes.</p><p>Si no estás conforme con cómo tratamos tus datos, puedes presentar una reclamación ante la CNIL (cnil.fr), la autoridad francesa de protección de datos, o ante la autoridad del país donde vives, por ejemplo la AEPD (aepd.es) en España.</p>` },
        { id: 'cookies', title: 'Cookies', html: `<p>Usamos una cookie para mantener tu sesión iniciada. No usamos cookies de seguimiento ni de publicidad. El almacenamiento local de tu navegador guarda tu CV si usas CVMaster sin cuenta, y tus preferencias (idioma, modo oscuro).</p>` },
        { id: 'security', title: 'Seguridad', html: `<p>Las contraseñas se cifran con bcrypt, todo viaja por HTTPS y los pagos con tarjeta los gestiona íntegramente Stripe.</p>` },
        { id: 'changes', title: 'Cambios en esta política', html: `<p>Si cambiamos esta política, actualizaremos la fecha de arriba y, si los cambios son importantes, te avisaremos por correo.</p>` },
      ],
    },
    {
      id: 'terms', tab: 'Condiciones del servicio', title: 'Condiciones del servicio',
      summary: [
        'Crear y previsualizar tu CV es gratis.',
        'Un PDF sin marca de agua cuesta 0,99 € por CV, un solo pago, sin suscripción.',
        'Lo que escribes es tuyo. Revisa las sugerencias de la IA antes de enviar tu CV.',
        '¿Algo ha ido mal? Avísanos. Te lo reenviamos o te devolvemos el dinero si tu CV nunca llegó.',
      ],
      sections: [
        { id: 'accept', title: 'Uso de CVMaster', html: `<p>Al usar CVMaster aceptas estas condiciones. Si no estás de acuerdo, no uses el servicio. Debes tener al menos 16 años.</p>` },
        { id: 'service', title: 'El servicio', html: `<p>CVMaster te permite crear, editar, adaptar y exportar CV con ayuda opcional de IA. Nos esforzamos por que funcione bien, pero se ofrece «tal cual» y a veces puede no estar disponible.</p>` },
        { id: 'account', title: 'Tu cuenta', html: `<ul>
          <li>Da datos correctos al registrarte.</li>
          <li>Mantén tu contraseña a salvo. Eres responsable de la actividad de tu cuenta.</li>
        </ul>` },
        { id: 'payments', title: 'Pagos', html: `<ul>
          <li>El PDF sin marca de agua de un CV es un pago único de <strong>0,99 €</strong>. Incluye el envío por correo, la descarga directa y reenvíos y descargas ilimitados de ese mismo CV, también después de editarlo.</li>
          <li>El PDF de vista previa con marca de agua es gratis.</li>
          <li>Las funciones de IA incluyen <strong>30 peticiones gratis al día</strong> para cuentas con el correo confirmado (los invitados y las cuentas sin confirmar tienen 5), que se renuevan cada día a medianoche (UTC). Un paquete de <strong>100 peticiones extra</strong> cuesta <strong>0,50 €</strong>; las peticiones extra no caducan, solo se usan después de las gratuitas del día y no tienen valor en efectivo.</li>
          <li>Invitaciones: quien se registra con tu enlace de invitación recibe 25 peticiones de IA extra. Cuando compra su primer PDF sin marca de agua, ganas un crédito de invitación, que desbloquea el PDF sin marca de agua de un CV. Los créditos no tienen valor en efectivo.</li>
          <li>Los pagos los procesa Stripe.</li>
          <li><strong>Derecho de desistimiento:</strong> normalmente tienes 14 días para cancelar una compra en línea. Como tu PDF (o tus peticiones de IA) se entregan de inmediato, al pagar nos pides que empecemos enseguida y confirmas que pierdes este derecho una vez hecha la entrega, como permite la normativa de consumo de la UE (en Francia, el artículo L221-28 del Code de la consommation).</li>
          <li>Si tu CV nunca llegó, o algo falló con un pago, contáctanos en un plazo de 14 días y te lo reenviaremos o te devolveremos el dinero.</li>
        </ul>` },
        { id: 'complaints', title: 'Reclamaciones', html: `<p>Si algo no te ha gustado, ya sea el servicio, un pago o el trato que recibiste, cuéntanoslo:</p><ul>
          <li>Usa <strong>Comentarios → Reclamación</strong> (en la barra lateral, en Ajustes o al final de esta página), o escribe a ${mail}.</li>
          <li>Indica qué pasó, cuándo y el correo de tu cuenta o de tu pago.</li>
          <li>Recibirás un número de referencia. Intentamos responder en 5 días hábiles y resolver las reclamaciones en 14 días.</li>
        </ul>` },
        { id: 'use', title: 'Uso aceptable', html: `<p>Por favor, no:</p><ul>
          <li>uses CVMaster para nada ilegal o engañoso;</li>
          <li>intentes saltarte los pagos o acceder a funciones de pago sin pagar;</li>
          <li>copies, apliques ingeniería inversa o revendas el servicio o sus plantillas;</li>
          <li>subas contenido ilegal, dañino o que vulnere los derechos de otra persona.</li>
        </ul>` },
        { id: 'reviews', title: 'Reseñas', html: `<p>Quienes han creado un CV pueden valorar CVMaster. Las valoraciones con estrellas cuentan de inmediato. Los comentarios escritos, y sus modificaciones posteriores, los revisamos antes de que aparezcan en nuestra web, para evitar spam, abusos y datos personales; hasta que se aprueba una modificación, se mantiene la versión anterior. Nunca eliminamos ni ocultamos una reseña por ser negativa, y no pagamos por reseñas.</p>` },
        { id: 'ai', title: 'Contenido generado por IA', html: `<p>Las sugerencias de la IA pueden equivocarse. CVMaster nunca añade nada sin tu aprobación, pero eres responsable de comprobar que todo lo que aparece en tu CV es cierto antes de enviarlo.</p>` },
        { id: 'ip', title: 'De quién es cada cosa', html: `<p>El contenido de tu CV es tuyo. La plataforma CVMaster, sus diseños y sus plantillas son nuestros.</p>` },
        { id: 'liability', title: 'Responsabilidad', html: `<p>No somos responsables de pérdidas indirectas o consecuentes, incluido el resultado de cualquier candidatura. Nada de estas condiciones limita los derechos que te reconoce la normativa de consumo.</p>` },
        { id: 'law', title: 'Ley aplicable', html: `<p>Estas condiciones se rigen por la ley francesa. Si eres consumidor, mantienes además la protección de las leyes de consumo imperativas del país donde vives y puedes presentar una reclamación ante los tribunales de tu país.</p>` },
        { id: 'notice', title: 'Aviso legal', html: `<ul>
          <li><strong>Editores:</strong> ${TEAM}, Francia, ${mail}</li>
          <li><strong>Alojamiento del sitio web:</strong> Vercel Inc. (vercel.com)</li>
          <li><strong>Alojamiento de la aplicación:</strong> Render Services, Inc. (render.com)</li>
          <li><strong>Base de datos:</strong> Neon (neon.tech)</li>
        </ul>` },
      ],
    },
  ]
}
