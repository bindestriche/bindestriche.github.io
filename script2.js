const imageUpload = document.getElementById('imageUpload')

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models//')
]).then(start)
async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages()
  console.log(labeledFaceDescriptors)
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  let image
  let canvas
  document.getElementById('ladestatus').innerText="geladen"
  imageUpload.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0])
    container.append(image)
    canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
	console.log("detections: ",detections)
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
	 setTimeout(function(){ confirm("Verfassungsschutz möchte auf Ihren Standort zugreifen."); }, 2000);
	 
  })
}



function loadLabeledImages() {
		// text
	let img1=`-0.08783179521560669,0.04493675008416176,0.048021234571933746,-0.06576337665319443,-0.10813096165657043,-0.006695029325783253,-0.0047264485619962215,-0.12795603275299072,0.0858917087316513,-0.09569474309682846,0.15379729866981506,0.05685141310095787,-0.2295587658882141,-0.031449977308511734,0.023522984236478806,0.10585455596446991,-0.10828535258769989,-0.04099028930068016,-0.18401935696601868,-0.13055579364299774,0.02006310597062111,0.13111986219882965,0.07084427028894424,-0.04170956462621689,-0.10684817284345627,-0.24859926104545593,-0.06199517101049423,-0.023333348333835602,0.011940433643758297,-0.0659513995051384,0.06169389933347702,-0.010655893012881279,-0.23340341448783875,-0.0643908828496933,-0.004527750890702009,0.0003340754774399102,-0.11457683145999908,-0.08030812442302704,0.16297896206378937,0.0559096597135067,-0.16980160772800446,0.10467522591352463,0.0634641945362091,0.22140085697174072,0.23646284639835358,-0.05380510166287422,0.01169173326343298,-0.0829455628991127,0.10148345679044724,-0.21574999392032623,0.06646329909563065,0.06305000185966492,0.1490921676158905,0.07415252178907394,0.059533119201660156,-0.08014099299907684,0.0051293447613716125,0.13957351446151733,-0.10853170603513718,0.09401652216911316,0.12869110703468323,-0.10883869975805283,-0.05305624380707741,-0.04935740306973457,0.08275000005960464,0.08068004250526428,-0.10187005251646042,-0.16444768011569977,0.08768157660961151,-0.14691805839538574,-0.10895594954490662,0.05089395493268967,-0.08972474187612534,-0.11007928103208542,-0.3145986795425415,0.043521054089069366,0.2835080921649933,0.0985182598233223,-0.20769211649894714,-0.09807153791189194,-0.05731508135795593,0.04983261972665787,0.03816813975572586,0.08579003810882568,-0.04657847434282303,-0.0972246527671814,-0.02729051373898983,0.03151299059391022,0.1932661235332489,-0.012602495029568672,-0.07936215400695801,0.28369322419166565,0.07219845801591873,-0.039770498871803284,0.020696518942713737,0.0841108113527298,-0.12879739701747894,-0.04900847747921944,-0.08258820325136185,0.0037240562960505486,0.025584043934941292,-0.1405327171087265,0.03768005594611168,0.16669435799121857,-0.17080746591091156,0.2787233293056488,-0.0586104542016983,0.024384010583162308,0.07287490367889404,0.0011056284420192242,-0.04390013590455055,-0.008123274892568588,0.09639013558626175,-0.14553698897361755,0.19890134036540985,0.1961304098367691,-0.0015438958071172237,0.08465956151485443,0.04784785211086273,0.09437940269708633,-0.056960850954055786,0.10463463515043259,-0.1688961237668991,-0.11068948358297348,-0.016041001304984093,-0.015326707623898983,0.027127636596560478,0.06221793219447136`
	let myarray=new Float32Array(img1.split(","));
	let labeled1= new faceapi.LabeledFaceDescriptors("hitler", [myarray]);
	return [labeled1]
}

function makeImageString(imgurls,label) {
  const labels = [label]
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= imgurls.length; i++) {
        const img = await faceapi.fetchImage(imgurls[i])
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor);
		
      }
console.log(descriptions);
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}