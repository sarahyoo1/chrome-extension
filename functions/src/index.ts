import { https } from "firebase-functions/v1";
import { authAdmin } from "../../src/libs/firebaseAdmin";

exports.createCustomToken = https.onRequest(async (req, res) => {
    const { uid } = req.body;
      try {
        const customToken = await authAdmin.createCustomToken(uid);
        res.json({ customToken });
    } catch (error) {
        res.status(500).send(error);
    }
});

exports.createToken = https.onCall((uid : string) => {
    authAdmin.createCustomToken(uid);
})
