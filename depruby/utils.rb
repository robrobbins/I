# Our utility methods
module Utils
  @source_files = []
  
  def self.is_js_file(ref)
    #File.fnmatch('*.js', ref)
    File.extname(ref) == '.js'
  end
  
  def self.is_directory(ref)
    File.directory? ref
  end
  
  def self.source_files
    @source_files
  end
  
  # return a list of normalized paths from a given root directory
  # expanding any sub-directories found while recursively searching
  def self.expandDirectories(search_ext)
    str = "**/*.{#{search_ext.join(',')}}" 
    Dir.glob(str) { |ref|
      puts "found #{ref}"
      @source_files.push(ref)
    }
  end
  
  def self.arr_to_hash(arr)
    h = {}
    arr.each {|i|
      h[i] = true
    }
    return h
  end
  
end