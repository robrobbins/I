require 'yaml'
require './utils.rb'
require './dependencies.rb'

# you are here...
I_AM = File.expand_path($PROGRAM_NAME)
I_RUBY_DIR = File.dirname(I_AM)
# load our config file
CFG = YAML.load_file('config.yaml') unless defined? CFG
# vars for this script
DW = CFG['depwriter']
#move to root and begin
Dir.chdir(DW['i_root'])
# save a ref to here as an absolute path to make navigating easier
I_ROOT_ABS = File.expand_path(Dir.getwd)

Utils.expandDirectories(DW['search_ext'], DW['exc_dirs'])

Dependencies.build_from_files(Utils.source_files, DW['demaximize'])

Dependencies.add_third_party(Utils.source_files, DW['ven_dirs'])

Dependencies.add_cdn(DW['cdn_hosted'])

Dependencies.build_matched_hash

if Dependencies.resolve_deps
  puts "All depencies resolved, writing deps file. Moving to #{DW['i_dir']}"
  # get the deps
  matched = Dependencies.matched
  Dir.chdir(DW['i_dir'])
  # save the absolute path to here so we can come back after writing min files
  I_DIR_ABS = File.expand_path(Dir.getwd)
  # open a file for writing
  out = File.open('deps.js', 'w') do |deps|
    matched.each_value {|dep|
      len = DW['rm_dir'].size
      if len > 0 and not dep.is_cdn
        st = dep.filename.index(DW['rm_dir'])
        fn = dep.filename.slice(st + len, dep.filename.size)
      else
        # no section to remove
        fn = dep.filename
      end
      # write deps with [min_suffix]?
      if DW['demaximize']
        if not dep.is_cdn and not dep.is_vendor # one of ours
          deps.puts "__i__.addDependency('#{dep.rename(fn, true)}', #{dep.provides}, #{dep.requires});"
          # move to root since all filenames are relative to it
          puts "moving #{I_ROOT_ABS}"
          Dir.chdir(I_ROOT_ABS)
          puts "moving to #{File.dirname(dep.filename)}"
          Dir.chdir(File.dirname(dep.filename))
          puts "writing min file"
          min = File.open(dep.rename(fn, false), 'w') {|m| m.puts dep.minify()}
          # go back to the i_dir
          puts "moving back to #{I_DIR_ABS}"
          Dir.chdir(I_DIR_ABS)
        elsif dep.is_cdn or dep.is_vendor # third party or cdn-hosted
          deps.puts "__i__.addDependency('#{fn}', #{dep.provides}, #{dep.requires});"
        end
      else
        deps.puts "__i__.addDependency('#{fn}', #{dep.provides}, #{dep.requires});"
      end
      # set a noCallback designation where appropriate
      if dep.is_cdn or dep.is_vendor or dep.no_callback
        deps.puts "__i__.setNoCallback(#{dep.provides});"
      end
    }
  end
  # go back to the start
  puts "deps.js written, moving back to #{I_RUBY_DIR}"
  Dir.chdir(I_RUBY_DIR)
else
  puts "Fail!"
end