i_am = File.expand_path($PROGRAM_NAME)
i_root = File.dirname(i_am)
# TODO Move this section to a config file
# location of ruby files relative to depwriter
rb_dir = '/depruby'
# dirname, relative to root, where i.js is
i_dir = 'public/js'
# the ext types (minus the dot) which may contain requires / provides
search_ext = ['js', 'erb']
# directory name, or array of names (relative to root), that hold 
# third party scripts you want added as dependencies
ven_dirs = ['public/js/vendor']

require ".#{rb_dir}/utils.rb"
require ".#{rb_dir}/dependencies.rb"

Utils.expandDirectories(search_ext)
# rip through the files looking for provides() / requires()
Dependencies.build_from_files(Utils.source_files)
# this seems cleaner to me as a separate step, rather than combined
# if you are adding provides and requires to your third party files
# manually comment the next method call out
Dependencies.add_third_party(Utils.source_files, 
  Utils.arr_to_hash(ven_dirs))
# put the hash together
Dependencies.build_matched_hash
if Dependencies.resolve_deps
  puts "All depencies resolved, writing deps file. Moving to #{i_dir}"
  # get the deps
  matched = Dependencies.matched 
  Dir.chdir(i_dir)
  # open a file for writing
  out = File.open('deps.js', 'w') do |deps|
    matched.each_value {|dep|
      # remove the filename up to i_dir as i.js finds the rel path at runtime
      rm = i_dir + '/'
      len = rm.size
      st = dep.filename.index(rm)
      fn = dep.filename.slice(st + len, dep.filename.size)
      deps.puts "I.addDependency('#{fn}', #{dep.get_provides}, #{dep.get_requires}, #{dep.get_load_attrs});"
    }
  end
  puts "deps.js written, moving back to #{i_root}"
  Dir.chdir(i_root)
else
  puts "Fail!"
end