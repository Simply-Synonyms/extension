import admin from 'firebase-admin'

export default async function getAuthToken(req, res) {
  if (!req.user) return res.status(401).send("No user")

  const token = await admin.auth().createCustomToken(req.user.uid)

  res.json({
    uid: req.user.uid,
    token
  })

  // const idToken = req.body.idToken.toString()
  // const csrfToken = req.body.csrfToken.toString()

  // if (csrfToken !== req.cookies.csrfToken) {
  //   res.status(401).send('UNAUTHORIZED')
  //   return
  // }

  // // 12 days
  // const expiresIn = 12 * 60 * 60 * 24 * 1000

  // admin
  //   .auth()
  //   .createSessionCookie(idToken, { expiresIn })
  //   .then(
  //     (sessionCookie) => {
  //       const options = { maxAge: expiresIn, httpOnly: true, secure: true };
  //       res.cookie('session', sessionCookie, options);
  //       res.end(JSON.stringify({ status: 'success' }));
  //     },
  //     (error) => {
  //       res.status(401).send('UNAUTHORIZED REQUEST!');
  //     }
  //   )
}
