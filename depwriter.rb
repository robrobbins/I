i_am = File.expand_path($PROGRAM_NAME)
i_root = File.dirname(i_am)
# TODO Move this section to a config file
# location of ruby files relative to depwriter
rb_dir = '/iRuby'
# dirname, relative to root, where i.js is
i_dir = 'js'
# a portion of the filename that should be removed when served (this is used
# as the src="..." attribute of the script tags)
rm_dir = ''
# the ext types (minus the dot) which may contain requires / provides
search_ext = ['js', 'html']
# directory name, or array of names (relative to root), that hold 
# third party scripts you want added as dependencies
ven_dirs = ['js/vendor']
# provided name and URL adress of hosted dependencies
# {'provided name': 'adress to dependency'}
# TODO document the //... workaround for https:// with IE
cdn_hosted = {
  'jquery' => 'http://code.jquery.com/jquery-1.5.2.min.js'
}

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
# add any cdn hosted dependencies so that files requiring one will resolve
Dependencies.add_cdn(cdn_hosted)
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
      len = rm_dir.size
      if len > 0
        st = dep.filename.index(rm_dir)
        fn = dep.filename.slice(st + len, dep.filename.size)
      else
        # no section to remove
        fn = dep.filename
      end
      deps.puts "I.addDependency('#{fn}', #{dep.get_provides}, #{dep.get_requires}, #{dep.get_load_attrs});"
    }
  end
  puts "deps.js written, moving back to #{i_root}"
  Dir.chdir(i_root)
else
  puts "Fail!"
end