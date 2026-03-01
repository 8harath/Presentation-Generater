/**
 * PPTX file generation using JSZip and XML manipulation
 * Creates a valid Office Open XML PowerPoint presentation
 */

import JSZip from 'jszip';
import type { ComposedSlide } from './slide-composer';
import type { TemplateType } from '@/lib/types/presentation';
import { logError } from '@/lib/utils/error-handler';

/**
 * Generate PPTX file from composed slides
 */
export async function generatePPTX(
  slides: ComposedSlide[],
  templateName: TemplateType,
  title: string = 'Presentation'
): Promise<Buffer> {
  try {
    const zip = new JSZip();

    // Create the directory structure
    zip.folder('[Content_Types]');
    zip.folder('_rels');
    zip.folder('ppt');
    zip.folder('ppt/slides');
    zip.folder('ppt/slideLayouts');
    zip.folder('ppt/slideMasters');
    zip.folder('ppt/_rels');
    zip.folder('ppt/theme');
    zip.folder('docProps');

    // Add [Content_Types].xml
    addContentTypes(zip, slides.length);

    // Add .rels files
    addRels(zip, slides.length);

    // Add presentation.xml
    addPresentation(zip, slides.length);

    // Add presentation.xml.rels
    addPresentationRels(zip, slides.length);

    // Add slide files
    for (let i = 0; i < slides.length; i++) {
      addSlide(zip, slides[i], i + 1);
    }

    // Add slide layout
    addSlideLayout(zip);

    // Add slide master
    addSlideMaster(zip);

    // Add theme
    addTheme(zip);

    // Add docProps
    addDocProps(zip, title);

    // Generate the file
    const pptxBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    return pptxBuffer;
  } catch (error) {
    logError('generatePPTX', error, { slides: slides.length, templateName });
    throw new Error(`Failed to generate PPTX: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Add [Content_Types].xml
 */
function addContentTypes(zip: JSZip, slideCount: number) {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n';
  xml += '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n';
  xml += '  <Default Extension="xml" ContentType="application/xml"/>\n';
  xml += '  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>\n';

  for (let i = 1; i <= slideCount; i++) {
    xml += `  <Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>\n`;
  }

  xml += '  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>\n';
  xml += '  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>\n';
  xml += '  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>\n';
  xml += '  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>\n';
  xml += '  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.custom-properties+xml"/>\n';
  xml += '</Types>';

  zip.file('[Content_Types].xml', xml);
}

/**
 * Add root .rels file
 */
function addRels(zip: JSZip, slideCount: number) {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n';
  xml += '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>\n';
  xml += '  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>\n';
  xml += '  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties" Target="docProps/app.xml"/>\n';
  xml += '</Relationships>';

  zip.folder('_rels')!.file('.rels', xml);
}

/**
 * Add presentation.xml
 */
function addPresentation(zip: JSZip, slideCount: number) {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n';
  xml += '  <p:sldIdLst>\n';

  for (let i = 1; i <= slideCount; i++) {
    xml += `    <p:sldId id="${256 + i}" r:id="rId${i + 1}"/>\n`;
  }

  xml += '  </p:sldIdLst>\n';
  xml += '</p:presentation>';

  zip.folder('ppt')!.file('presentation.xml', xml);
}

/**
 * Add presentation.xml.rels
 */
function addPresentationRels(zip: JSZip, slideCount: number) {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n';
  xml += '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>\n';

  for (let i = 1; i <= slideCount; i++) {
    xml += `  <Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>\n`;
  }

  xml += '  <Relationship Id="rId' + (slideCount + 2) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>\n';
  xml += '</Relationships>';

  zip.folder('ppt/_rels')!.file('presentation.xml.rels', xml);
}

/**
 * Add individual slide
 */
function addSlide(zip: JSZip, slide: ComposedSlide, slideNumber: number) {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n';
  xml += '  <p:cSld>\n';
  xml += `    <p:bg><p:bgPr><a:solidFill xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:srgbClr val="${slide.backgroundColor.substring(1)}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>\n`;
  xml += '    <p:spTree>\n';
  xml += '      <p:nvGrpSpPr><p:cNvPr id="1" name="Title"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>\n';
  xml += '      <p:grpSpPr><a:xfrm xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:off x="0" y="0"/><a:ext cx="9144000" cy="6858000"/><a:chOff x="0" y="0"/><a:chExt cx="9144000" cy="6858000"/></a:xfrm></p:grpSpPr>\n';

  // Add title shape
  xml += createTitleShape(slide);

  // Add content shapes
  xml += createContentShapes(slide);

  xml += '    </p:spTree>\n';
  xml += '  </p:cSld>\n';
  xml += '</p:sld>';

  zip.folder('ppt/slides')!.file(`slide${slideNumber}.xml`, xml);
}

/**
 * Create title shape XML
 */
function createTitleShape(slide: ComposedSlide): string {
  const titleColor = slide.titleColor.substring(1);

  return `      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:off x="457200" y="274638"/>
            <a:ext cx="8229600" cy="1371600"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
        <p:txBody>
          <a:bodyPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="${slide.titleFontSize * 100}" b="1">
                <a:solidFill><a:srgbClr val="${titleColor}"/></a:solidFill>
              </a:rPr>
              <a:t>${escapeXml(slide.title)}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
  `;
}

/**
 * Create content shapes XML
 */
function createContentShapes(slide: ComposedSlide): string {
  const textColor = slide.textColor.substring(1);
  let xml = '';
  let yOffset = 1828800;

  for (const bullet of slide.bullets) {
    xml += `      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="${3 + xml.length}" name="Content"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:off x="457200" y="${yOffset}"/>
            <a:ext cx="8229600" cy="914400"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
        <p:txBody>
          <a:bodyPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>
          <a:p>
            <a:pPr lvl="0"/>
            <a:r>
              <a:rPr lang="en-US" sz="${slide.bodyFontSize * 100}">
                <a:solidFill><a:srgbClr val="${textColor}"/></a:solidFill>
              </a:rPr>
              <a:t>• ${escapeXml(bullet)}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    `;
    yOffset += 914400;
  }

  return xml;
}

/**
 * Add slide layout
 */
function addSlideLayout(zip: JSZip) {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<p:sldLayout xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n';
  xml += '  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name="Title"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr></p:spTree></p:cSld>\n';
  xml += '</p:sldLayout>';

  zip.folder('ppt/slideLayouts')!.file('slideLayout1.xml', xml);
}

/**
 * Add slide master
 */
function addSlideMaster(zip: JSZip) {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<p:sldMaster xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n';
  xml += '  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name="Title"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr></p:spTree></p:cSld>\n';
  xml += '</p:sldMaster>';

  zip.folder('ppt/slideMasters')!.file('slideMaster1.xml', xml);
}

/**
 * Add theme
 */
function addTheme(zip: JSZip) {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">\n';
  xml += '</a:theme>';

  zip.folder('ppt/theme')!.file('theme1.xml', xml);
}

/**
 * Add docProps
 */
function addDocProps(zip: JSZip, title: string) {
  const now = new Date().toISOString();

  let coreXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  coreXml += '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/officeDocument/2006/metadata/core-properties">\n';
  coreXml += `  <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">Generated by Presentation Generator</dc:creator>\n`;
  coreXml += `  <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">${escapeXml(title)}</dc:title>\n`;
  coreXml += `  <dcterms:created xmlns:dcterms="http://purl.org/dc/terms/" xsi:type="dcterms:W3CDTF" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">${now}</dcterms:created>\n`;
  coreXml += '</cp:coreProperties>';

  let appXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  appXml += '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties">\n';
  appXml += '</Properties>';

  zip.folder('docProps')!.file('core.xml', coreXml);
  zip.folder('docProps')!.file('app.xml', appXml);
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
