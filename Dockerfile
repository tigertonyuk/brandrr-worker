FROM node:20-bullseye

RUN apt-get update && apt-get install -y ffmpeg poppler-utils ghostscript fonts-dejavu-core librsvg2-bin && rm -rf /var/lib/apt/lists/*

# Install Google Fonts into subdirectories matching video.js FONT_MAP paths
# e.g. /usr/share/fonts/google/roboto/Roboto-Regular.ttf
RUN mkdir -p /usr/share/fonts/google/roboto \
             /usr/share/fonts/google/opensans \
             /usr/share/fonts/google/montserrat \
             /usr/share/fonts/google/lato \
             /usr/share/fonts/google/oswald \
             /usr/share/fonts/google/raleway \
             /usr/share/fonts/google/playfairdisplay \
             /usr/share/fonts/google/robotoslab \
             /usr/share/fonts/google/poppins \
             /usr/share/fonts/google/nunito \
             /usr/share/fonts/google/crimsontext \
             /usr/share/fonts/google/bitter \
             /usr/share/fonts/google/dancingscript \
             /usr/share/fonts/google/greatvibes \
             /usr/share/fonts/google/pacifico \
             /usr/share/fonts/google/caveat \
             /usr/share/fonts/google/bebasneue \
             /usr/share/fonts/google/anton \
             /usr/share/fonts/google/righteous \
             /usr/share/fonts/google/permanentmarker \
             /usr/share/fonts/google/bangers \
             /usr/share/fonts/google/spacemono \
             /usr/share/fonts/google/sourcecodepro \
             /usr/share/fonts/google/inconsolata \
             /usr/share/fonts/google/firasans \
             /usr/share/fonts/google/josefinsans \
             /usr/share/fonts/google/cormorantgaramond \
             /usr/share/fonts/google/librebaskerville \
             /usr/share/fonts/google/quicksand \
             /usr/share/fonts/google/comfortaa \
             /usr/share/fonts/google/architectsdaughter \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/roboto/Roboto%5Bwdth%2Cwght%5D.ttf" -o /usr/share/fonts/google/roboto/Roboto-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/opensans/OpenSans%5Bwdth%2Cwght%5D.ttf" -o /usr/share/fonts/google/opensans/OpenSans-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf" -o /usr/share/fonts/google/montserrat/Montserrat-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/lato/Lato-Regular.ttf" -o /usr/share/fonts/google/lato/Lato-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/oswald/Oswald%5Bwght%5D.ttf" -o /usr/share/fonts/google/oswald/Oswald-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/raleway/Raleway%5Bwght%5D.ttf" -o /usr/share/fonts/google/raleway/Raleway-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf" -o /usr/share/fonts/google/playfairdisplay/PlayfairDisplay-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/robotoslab/RobotoSlab%5Bwght%5D.ttf" -o /usr/share/fonts/google/robotoslab/RobotoSlab-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf" -o /usr/share/fonts/google/poppins/Poppins-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/nunito/Nunito%5Bwght%5D.ttf" -o /usr/share/fonts/google/nunito/Nunito-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/crimsontext/CrimsonText-Regular.ttf" -o /usr/share/fonts/google/crimsontext/CrimsonText-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/bitter/Bitter%5Bwght%5D.ttf" -o /usr/share/fonts/google/bitter/Bitter-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/dancingscript/DancingScript%5Bwght%5D.ttf" -o /usr/share/fonts/google/dancingscript/DancingScript-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/greatvibes/GreatVibes-Regular.ttf" -o /usr/share/fonts/google/greatvibes/GreatVibes-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/pacifico/Pacifico-Regular.ttf" -o /usr/share/fonts/google/pacifico/Pacifico-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/caveat/Caveat%5Bwght%5D.ttf" -o /usr/share/fonts/google/caveat/Caveat-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/bebasneue/BebasNeue-Regular.ttf" -o /usr/share/fonts/google/bebasneue/BebasNeue-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf" -o /usr/share/fonts/google/anton/Anton-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/righteous/Righteous-Regular.ttf" -o /usr/share/fonts/google/righteous/Righteous-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/permanentmarker/PermanentMarker-Regular.ttf" -o /usr/share/fonts/google/permanentmarker/PermanentMarker-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/bangers/Bangers-Regular.ttf" -o /usr/share/fonts/google/bangers/Bangers-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/spacemono/SpaceMono-Regular.ttf" -o /usr/share/fonts/google/spacemono/SpaceMono-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/sourcecodepro/SourceCodePro%5Bwght%5D.ttf" -o /usr/share/fonts/google/sourcecodepro/SourceCodePro-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/inconsolata/Inconsolata%5Bwght%5D.ttf" -o /usr/share/fonts/google/inconsolata/Inconsolata-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/firasans/FiraSans-Regular.ttf" -o /usr/share/fonts/google/firasans/FiraSans-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/josefinsans/JosefinSans%5Bwght%5D.ttf" -o /usr/share/fonts/google/josefinsans/JosefinSans-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/cormorantgaramond/CormorantGaramond-Regular.ttf" -o /usr/share/fonts/google/cormorantgaramond/CormorantGaramond-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/librebaskerville/LibreBaskerville-Regular.ttf" -o /usr/share/fonts/google/librebaskerville/LibreBaskerville-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/quicksand/Quicksand%5Bwght%5D.ttf" -o /usr/share/fonts/google/quicksand/Quicksand-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/comfortaa/Comfortaa%5Bwght%5D.ttf" -o /usr/share/fonts/google/comfortaa/Comfortaa-Regular.ttf || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/architectsdaughter/ArchitectsDaughter-Regular.ttf" -o /usr/share/fonts/google/architectsdaughter/ArchitectsDaughter-Regular.ttf || true \
  && fc-cache -f -v

# Create Bold variants by copying variable fonts (they contain all weights)
# and downloading separate Bold files for static fonts (Lato, Poppins, etc.)
RUN cp /usr/share/fonts/google/roboto/Roboto-Regular.ttf /usr/share/fonts/google/roboto/Roboto-Bold.ttf 2>/dev/null || true \
  && cp /usr/share/fonts/google/opensans/OpenSans-Regular.ttf /usr/share/fonts/google/opensans/OpenSans-Bold.ttf 2>/dev/null || true \
  && cp /usr/share/fonts/google/montserrat/Montserrat-Regular.ttf /usr/share/fonts/google/montserrat/Montserrat-Bold.ttf 2>/dev/null || true \
  && curl -fSL "https://github.com/google/fonts/raw/main/ofl/lato/Lato-Bold.ttf" -o /usr/share/fonts/google/lato/Lato-Bold.ttf 2>/dev/null || true \
  && cp /usr/share/fonts/google/oswald/Oswald-Regular.ttf /usr/share/fonts/google/oswald/Oswald-Bold.ttf 2>/dev/null || true \
  && cp /usr/share/fonts/google/raleway/Raleway-Regular.ttf /usr/share/fonts/google/raleway/Raleway-Bold.ttf 2>/dev/null || true \
  && cp /usr/share/fonts/google/playfairdisplay/PlayfairDisplay-Regular.ttf /usr/share/fonts/google/playfairdisplay/PlayfairDisplay-Bold.ttf 2>/dev/null || true \
  && fc-cache -f -v

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY src ./src
ENV NODE_ENV=production
ENV PORT=10000
EXPOSE 10000
CMD ["npm", "start"]
