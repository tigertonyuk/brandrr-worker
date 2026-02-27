FROM node:20-bullseye

RUN apt-get update && apt-get install -y ffmpeg poppler-utils ghostscript fonts-dejavu-core librsvg2-bin && rm -rf /var/lib/apt/lists/*

# Install popular Google Fonts
RUN mkdir -p /usr/share/fonts/google && \
    cd /usr/share/fonts/google && \
    for url in \
      "https://github.com/google/fonts/raw/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/merriweather/Merriweather-Regular.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/lora/Lora%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/raleway/Raleway%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/oswald/Oswald%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/robotoslab/RobotoSlab%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/nunito/Nunito%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/crimsontext/CrimsonText-Regular.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/bitter/Bitter%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/dancingscript/DancingScript%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/greatvibes/GreatVibes-Regular.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/pacifico/Pacifico-Regular.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/caveat/Caveat%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/bebasneue/BebasNeue-Regular.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/righteousregular/Righteous-Regular.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/permanentmarker/PermanentMarker-Regular.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/bangers/Bangers-Regular.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/spacemono/SpaceMono-Regular.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/sourcecodepro/SourceCodePro%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/inconsolata/Inconsolata%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/firasans/FiraSans-Regular.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/josefinsans/JosefinSans%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/cormorantgaramond/CormorantGaramond-Regular.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/librebaskerville/LibreBaskerville-Regular.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/quicksand/Quicksand%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/comfortaa/Comfortaa%5Bwght%5D.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/architectsdaughter/ArchitectsDaughter-Regular.ttf" \
    ; do curl -fSL "$url" -o "$(basename "$(echo "$url" | sed 's/%5B/[/g;s/%5D/]/g')")" || true; done && \
    fc-cache -f -v

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --omit=dev

COPY src ./src

ENV NODE_ENV=production

ENV PORT=10000

EXPOSE 10000

CMD ["npm", "start"]
