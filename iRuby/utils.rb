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
  def self.expandDirectories(search_ext, exc_dirs)
    str = "**/*.{#{search_ext.join(',')}}" 
    Dir.glob(str) { |ref|
      puts "found #{ref}"
      if exc_dirs.include? File.dirname(ref)
        puts 'excluded'
      else
        @source_files.push(ref)
      end
    }
  end
end