<?php
/**
* makeTeaser returns a cleanly truncated teaser string from the
* beginning of the article along with a link to
* the full article. Truncation will follow the following Rules...
* Truncation preferably happens at the nearest white space character
* (space, newline, tab) or
* punctuation character (comma, fullstop, colon, semicolon,
* exclamation) that is less than maxLength specified.
*
* Additional Information:
* All characters are single byte latin-1 characters.
* Content is expected to be in plain text, please assume that there
* are no HTML or SGML tags.
*
* Example
* Content:
* I quickly learned how fishy this world could be. A client I knew who
* specialized in auto loans invited me up to his desk to show me how
* to structure subprime debt. Eager to please, I promised I could
* enhance my software to model his deals in less than a month. But when
* I glanced at the takeout in the deal, I couldn't believe my eyes.
*
* Teaser:
* I quickly learned how fishy this world could be. A client I knew who
* specialized in auto loans invited me up to his desk to show me how
* to structure subprime debt. Eager to please, I
*
* @param $content - String, Full/Partial Content of the article
* @param $url - String, Absolute URL to the Full article
* @param $linkText - String, Text to show for the link
* @param $minLength - Number, Preferred minimum length of the teaser
* (non binding)
* @param $maxLength - Number, Maximum length of the teaser, optional. * If not set, maxLength = minLength+50
* @return String Teaser That will be displayed
*/

function makeTeaser($content, $url, $linkText, $minLength, $maxLength=NULL)
{
    $encoding = 'ISO-8859-1';
    $flags =  ENT_COMPAT;

    $link = '<a href="' .  htmlspecialchars($url,  ENT_COMPAT, $encoding) . '">'
          .  htmlspecialchars($linkText, $flags, $encoding)
          . '</a>';

    $contentLength = strlen($content);
    if($contentLength <= $minLength){
        return htmlspecialchars($content, $flags, $encoding).$link;
    }

    if($maxLength === NULL) $maxLength = $minLength + 50;
    if($maxLength >= $contentLength){
        return htmlspecialchars($content, $flags, $encoding).$link;
    }

    $stops = array(' ', "\n", "\t", ',', '.', ':', ';');

    /**
     * If there is no stop signs between $minLength and $maxLength
     * then last word in content will be cutten. Not sure if such behavior
     * is right but as of "Truncation *preferably* happens at the nearest... "
     */
    $maxPos = $minLength;

    $offset = $maxLength - $contentLength;
    /**
     * Find most right stop sign
     * Search backwards from $maxLength to start of string
     * Test show that such approach is a little bit faster on
     * avarage content then preg_math_all with PREG_OFFSET_CAPTURE
     */
    foreach($stops as $stop){
        if(($stopPos = strrpos($content, $stop, $offset)) !== FALSE
         && $stopPos > $maxPos){

            $maxPos = $stopPos;
        }
    }

    /**
     * Remove remaining stop's signs from and of teaser
     * For example content is: 
     *  Abcd, hello
     *
     * Most right stop sign that will be found is space, but after trancation on space
     * comma will stay.
     *  Abcd*,*
     *
     * This will remove comma.
     */
    while($maxPos >= 0 && in_array($content[$maxPos-1], $stops)) $maxPos--;

    return htmlspecialchars(substr($content, 0, $maxPos), $flags, $encoding).$link;
}
