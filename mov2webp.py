import os
from os import listdir
from os.path import isfile, join
import ffmpeg
from functools import reduce

#ffmpeg -i copied.mov -vcodec libwebp -filter:v fps=fps=20 -lossless 0  -compression_level 3 -q:v 70 -loop 1 -preset picture -an -vsync 0 -s 800:600 output_lossy.webp

destDir = os.path.join(os.path.expanduser("~"), "Desktop")+'/features/cropped/trimmed'
toSave = destDir+'/converted'
def ver1():
  onlyfiles = [f for f in listdir(destDir) if isfile(join(destDir, f))]

  stream = ffmpeg.input(destDir+'/copied.mov');
  stream = ffmpeg.filter(stream, 'fps', fps=25, round='up')
  stream = ffmpeg.output(stream, destDir+'outputPy.webp')
  ffmpeg.run(stream)

def ver2():
  width, height, divider = 2940, 1680, 1
  resolution = '{0}:{1}'.format(int(width/divider), int(height/divider));
  # resolution = '735:420'
  # resolution = '735:420'
  outputExtension = '.webm'
  candidates = list(filter(lambda fname: fname.endswith('.mov') , os.listdir(destDir))) 
  _toSave = list(filter(lambda fname: fname.endswith(outputExtension) , os.listdir(toSave))) 
  replacer = lambda ext: (lambda x:x.replace(ext, ''))

  candidatesWoExtensions = list(map(replacer('.mov'), candidates))
  _toSaveWoExtensions = list(map(replacer(outputExtension), _toSave))

  todos = []
  print("--- Found {} movie clips ---".format(len(candidates)))
  for fname in candidatesWoExtensions:
    if(fname in _toSaveWoExtensions):
      print(" - pass : {}".format(fname));
      pass
    else :
      print(" - todo : {}".format(fname));
      todos.append(fname+'.mov')

  convertCount = 0;
  for i, filename in enumerate(todos):
    fromFile = destDir+'/'+filename;
    destFile = '"{0}/{1}{2}"'.format(toSave,filename,outputExtension).replace('.mov', '');
    if (filename.endswith(".mov")): #or .avi, .mpeg, whatever.
      convertCount += 1
      query = 'ffmpeg -i "{0}" -filter:v fps=fps=20 -lossless 0  -compression_level 3 -q:v 70 -loop 0 -preset picture -an -s {1} {2}'.format(fromFile, resolution, destFile);
      print('query:',query);
      os.system(query)
    else:
        continue
  print("--- Converted {} clips. End of conversion ---".format(convertCount))

def main():
  ver2()

if __name__ == '__main__':
  main()
# Generate thumbnail for video
# (
#     ffmpeg
#     .input(in_filename, ss=time)
#     .filter('scale', width, -1)
#     .output(out_filename, vframes=1)
#     .run()
# )